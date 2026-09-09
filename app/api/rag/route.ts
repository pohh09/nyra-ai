import { NextResponse } from 'next/server';
import { generateEmbedding, cosineSimilarity } from '@/lib/services/embeddingService';
import { extractTargetPageNumbers } from '@/lib/services/ragService';

export interface RAGSearchRequest {
  query: string;
  chunks: Array<{
    id: string;
    text: string;
    pageNumber?: number;
    documentTitle: string;
    embedding?: number[];
  }>;
  topK?: number;
}

function computeLexicalScore(queryTokens: string[], text: string): number {
  if (queryTokens.length === 0 || !text) return 0;
  const lower = text.toLowerCase();
  let matches = 0;
  for (const token of queryTokens) {
    if (lower.includes(token)) matches += 1;
  }
  return matches / queryTokens.length;
}

export async function POST(req: Request) {
  try {
    const body: RAGSearchRequest = await req.json();
    const { query, chunks = [], topK = 6 } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    const targetPages = extractTargetPageNumbers(query);
    const targetPagesSet = new Set(targetPages);

    // 1. If explicit page number is queried, prioritize and ONLY return chunks matching target page
    if (targetPages.length > 0) {
      const pageMatched = chunks.filter((c) => c.pageNumber && targetPagesSet.has(c.pageNumber));
      if (pageMatched.length > 0) {
        const pageResults = pageMatched.map((chunk, idx) => ({
          ...chunk,
          score: Math.max(0.95, 1.0 - idx * 0.02),
          matchPercentage: 100,
          isPageMatch: true,
        }));

        return NextResponse.json({
          success: true,
          query,
          targetPages,
          results: pageResults.slice(0, topK),
          totalScored: chunks.length,
        });
      } else {
        return NextResponse.json({
          success: true,
          query,
          targetPages,
          results: [],
          totalScored: chunks.length,
        });
      }
    }

    // 2. Hybrid vector + lexical scoring with confidence filter
    const queryVector = generateEmbedding(query);
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const minScore = 0.18;
    const scoredChunks: any[] = [];

    for (const chunk of chunks) {
      const chunkVector =
        chunk.embedding && chunk.embedding.length === 384
          ? chunk.embedding
          : generateEmbedding(chunk.text);

      const vectorScore = cosineSimilarity(queryVector, chunkVector);
      const lexicalScore = computeLexicalScore(queryTokens, chunk.text);
      const hybridScore = vectorScore * 0.60 + lexicalScore * 0.40;

      if (hybridScore >= minScore) {
        scoredChunks.push({
          ...chunk,
          score: Math.round(hybridScore * 100) / 100,
          matchPercentage: Math.round(Math.max(0, Math.min(100, hybridScore * 100))),
          isPageMatch: false,
        });
      }
    }

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    const topResults = scoredChunks.slice(0, topK);

    return NextResponse.json({
      success: true,
      query,
      targetPages,
      results: topResults,
      totalScored: chunks.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'RAG search error' }, { status: 500 });
  }
}
