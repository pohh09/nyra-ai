import { generateEmbedding, cosineSimilarity } from './embeddingService';
import { DocumentRecord } from '@/lib/types';
import { DocumentPage } from '@/lib/extractPdfText';

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  totalChunks: number;
  text: string;
  pageNumber: number;
  embedding: number[];
  charCount: number;
}

export interface SearchResultChunk {
  chunk: DocumentChunk;
  score: number;
  isPageMatch?: boolean;
  citationLabel: string;
}

const DOCUMENTS_STORAGE_KEY = 'nyra_rag_documents';
const CHUNKS_STORAGE_KEY = 'nyra_rag_chunks';

/**
 * Extract target page numbers from user query if explicitly mentioned.
 * Examples handled:
 * - "What information is on page 13?" -> [13]
 * - "What is on pg. 42?" -> [42]
 * - "Show me page 7 and 8" -> [7, 8]
 * - "Summarize pages 10-12" -> [10, 11, 12]
 */
export function extractTargetPageNumbers(query: string): number[] {
  if (!query || typeof query !== 'string') return [];

  const pages = new Set<number>();
  const cleanQuery = query.toLowerCase();

  // Pattern 1: Range "pages 10-12", "pages 10 to 12"
  const rangeRegex = /\b(?:pages?|pgs?\.?|p\.?)\s*(\d+)\s*(?:-|to)\s*(\d+)\b/gi;
  let rangeMatch;
  while ((rangeMatch = rangeRegex.exec(cleanQuery)) !== null) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start && end - start <= 20) {
      for (let p = start; p <= end; p++) {
        pages.add(p);
      }
    }
  }

  // Pattern 2: Single or comma/and-separated page mentions: "page 13", "pg. 13", "p 13", "page 13 and 14"
  const singleRegex = /\b(?:pages?|pgs?\.?|p\.?)\s*#?\s*(\d+)\b/gi;
  let singleMatch;
  while ((singleMatch = singleRegex.exec(cleanQuery)) !== null) {
    const pNum = parseInt(singleMatch[1], 10);
    if (!isNaN(pNum) && pNum > 0 && pNum < 10000) {
      pages.add(pNum);
    }
  }

  // Pattern 3: Specific natural phrasing like "page number 13", "page no 13"
  const phrasingRegex = /\b(?:page\s+number|page\s+no\.?)\s*#?\s*(\d+)\b/gi;
  let phraseMatch;
  while ((phraseMatch = phrasingRegex.exec(cleanQuery)) !== null) {
    const pNum = parseInt(phraseMatch[1], 10);
    if (!isNaN(pNum) && pNum > 0) {
      pages.add(pNum);
    }
  }

  // Pattern 4: Ordinal phrasing like "40th page", "13th page", "1st page", "2nd page", "3rd page"
  const ordinalRegex = /\b(\d+)(?:st|nd|rd|th)\s+pages?\b/gi;
  let ordMatch;
  while ((ordMatch = ordinalRegex.exec(cleanQuery)) !== null) {
    const pNum = parseInt(ordMatch[1], 10);
    if (!isNaN(pNum) && pNum > 0 && pNum < 10000) {
      pages.add(pNum);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Split text from structured DocumentPages into page-preserved semantic chunks.
 */
export function chunkDocumentPages(
  pages: Array<{ pageNumber: number; text: string; charCount?: number }>,
  docName: string,
  docId: string,
  options: { chunkSize?: number; overlap?: number } = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 650;
  const overlap = options.overlap || 120;
  const chunks: DocumentChunk[] = [];

  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageNum = page.pageNumber || 1;
    const pageText = (page.text || '').replace(/\r\n/g, '\n').trim();

    if (!pageText) continue;

    if (pageText.length <= chunkSize) {
      // Entire page fits in a single chunk
      const embedding = generateEmbedding(pageText);
      chunks.push({
        id: `chunk_${docId}_${pageNum}_${globalChunkIndex}`,
        documentId: docId,
        documentName: docName,
        chunkIndex: globalChunkIndex,
        totalChunks: 0,
        text: pageText,
        pageNumber: pageNum,
        embedding,
        charCount: pageText.length,
      });
      globalChunkIndex++;
    } else {
      // Long page: create overlapping sliding window chunks strictly bounded to this page
      let startIdx = 0;
      let pageChunkIdx = 0;

      while (startIdx < pageText.length) {
        const endIdx = Math.min(startIdx + chunkSize, pageText.length);
        let chunkSlice = pageText.slice(startIdx, endIdx).trim();

        // Snap to nearest sentence boundary or space to prevent word slicing
        if (endIdx < pageText.length) {
          const lastSentenceEnd = Math.max(
            chunkSlice.lastIndexOf('. '),
            chunkSlice.lastIndexOf('.\n'),
            chunkSlice.lastIndexOf('? '),
            chunkSlice.lastIndexOf('! ')
          );

          if (lastSentenceEnd > chunkSize * 0.6) {
            chunkSlice = chunkSlice.slice(0, lastSentenceEnd + 1).trim();
          } else {
            const lastSpace = chunkSlice.lastIndexOf(' ');
            if (lastSpace > chunkSize * 0.7) {
              chunkSlice = chunkSlice.slice(0, lastSpace).trim();
            }
          }
        }

        if (chunkSlice.length > 25) {
          const embedding = generateEmbedding(chunkSlice);
          chunks.push({
            id: `chunk_${docId}_${pageNum}_${globalChunkIndex}`,
            documentId: docId,
            documentName: docName,
            chunkIndex: globalChunkIndex,
            totalChunks: 0,
            text: chunkSlice,
            pageNumber: pageNum,
            embedding,
            charCount: chunkSlice.length,
          });
          globalChunkIndex++;
          pageChunkIdx++;
        }

        const advance = chunkSlice.length > overlap ? chunkSlice.length - overlap : chunkSize - overlap;
        startIdx += Math.max(50, advance);
      }
    }
  }

  for (const c of chunks) {
    c.totalChunks = chunks.length;
  }

  return chunks;
}

/**
 * Split unstructured text into chunks. Detects embedded [Page X] markers if available.
 */
export function chunkDocumentText(
  text: string,
  docName: string,
  docId: string,
  options: { chunkSize?: number; overlap?: number } = {}
): DocumentChunk[] {
  if (!text || text.trim().length === 0) return [];

  // Check if text has explicit [Page X of Y] or [Page X] tags
  const pageTagRegex = /\[Page\s+(\d+)(?:\s+of\s+\d+)?\]/i;
  if (pageTagRegex.test(text)) {
    const rawPages: Array<{ pageNumber: number; text: string }> = [];
    const parts = text.split(/(?=\[Page\s+\d+(?:\s+of\s+\d+)?\])/i);

    for (const part of parts) {
      const match = part.match(/\[Page\s+(\d+)(?:\s+of\s+\d+)?\]/i);
      const pageNum = match ? parseInt(match[1], 10) : rawPages.length + 1;
      const cleanContent = part.replace(/\[Page\s+\d+(?:\s+of\s+\d+)?\]\s*/i, '').trim();
      if (cleanContent) {
        rawPages.push({ pageNumber: pageNum, text: cleanContent });
      }
    }

    if (rawPages.length > 0) {
      return chunkDocumentPages(rawPages, docName, docId, options);
    }
  }

  // Fallback: estimate ~1800 chars per page
  const chunkSize = options.chunkSize || 650;
  const overlap = options.overlap || 120;
  const chunks: DocumentChunk[] = [];
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  const charsPerPage = 1800;

  let startIdx = 0;
  let chunkIndex = 0;

  while (startIdx < cleanText.length) {
    const endIdx = Math.min(startIdx + chunkSize, cleanText.length);
    let chunkText = cleanText.slice(startIdx, endIdx).trim();

    if (endIdx < cleanText.length) {
      const lastSpace = chunkText.lastIndexOf(' ');
      if (lastSpace > chunkSize * 0.7) {
        chunkText = chunkText.slice(0, lastSpace).trim();
      }
    }

    if (chunkText.length > 20) {
      const pageNumber = Math.max(1, Math.floor(startIdx / charsPerPage) + 1);
      const embedding = generateEmbedding(chunkText);

      chunks.push({
        id: `chunk_${docId}_${chunkIndex}`,
        documentId: docId,
        documentName: docName,
        chunkIndex,
        totalChunks: 0,
        text: chunkText,
        pageNumber,
        embedding,
        charCount: chunkText.length,
      });

      chunkIndex++;
    }

    startIdx += chunkSize - overlap;
  }

  for (const c of chunks) {
    c.totalChunks = chunks.length;
  }

  return chunks;
}

// ----------------------------------------------------
// DOCUMENT AND CHUNK STORAGE & RECOVERY
// ----------------------------------------------------

/**
 * Reconstructs DocumentPage array from text with [Page X of Y] or [Page X] tags.
 */
export function extractPageMapFromText(text: string): DocumentPage[] {
  if (!text) return [];
  const pageMap: DocumentPage[] = [];
  const parts = text.split(/(?=\[Page\s+\d+(?:\s+of\s+\d+)?\])/i);

  for (const part of parts) {
    const match = part.match(/\[Page\s+(\d+)(?:\s+of\s+\d+)?\]/i);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      const cleanContent = part.replace(/\[Page\s+\d+(?:\s+of\s+\d+)?\]\s*/i, '').trim();
      pageMap.push({
        pageNumber: pageNum,
        text: cleanContent,
        charCount: cleanContent.length,
      });
    }
  }

  return pageMap;
}

/**
 * Extracts exact, unchunked text for a specific page number directly from DocumentRecord or raw text.
 */
export function extractExactPageText(
  source: DocumentRecord | string | undefined,
  pageNumber: number
): { found: boolean; text: string; pageNumber: number } {
  if (!source) return { found: false, text: '', pageNumber };

  // 1. If source is a DocumentRecord with pageMap
  if (typeof source === 'object' && source.pageMap && source.pageMap.length > 0) {
    const pageItem = source.pageMap.find((p) => p.pageNumber === pageNumber);
    if (pageItem) {
      return { found: true, text: pageItem.text.trim(), pageNumber };
    }
  }

  // 2. Extract from raw text using regex
  const rawText = typeof source === 'string' ? source : source.extractedText || '';
  if (rawText) {
    const regex = new RegExp(`\\[Page\\s+${pageNumber}(?:\\s+of\\s+\\d+)?\\]([\\s\\S]*?)(?=\\[Page\\s+\\d+(?:\\s+of\\s+\\d+)?\\]|$)`, 'i');
    const match = rawText.match(regex);
    if (match) {
      return { found: true, text: match[1].trim(), pageNumber };
    }

    // Check if reconstructed pageMap finds it
    const reconstructed = extractPageMapFromText(rawText);
    const foundPage = reconstructed.find((p) => p.pageNumber === pageNumber);
    if (foundPage) {
      return { found: true, text: foundPage.text.trim(), pageNumber };
    }
  }

  return { found: false, text: '', pageNumber };
}

export function getIndexedDocuments(): DocumentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) return [];
    const docs: DocumentRecord[] = JSON.parse(raw);

    // Auto-heal documents: ensure pageMap is present on every document
    let modified = false;
    for (const doc of docs) {
      if ((!doc.pageMap || doc.pageMap.length === 0) && doc.extractedText) {
        const pMap = extractPageMapFromText(doc.extractedText);
        if (pMap.length > 0) {
          doc.pageMap = pMap;
          doc.pages = pMap.length;
          modified = true;
        }
      }
    }

    if (modified) {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    }

    return docs;
  } catch (e) {
    console.error('Failed to load indexed documents:', e);
    return [];
  }
}

export function saveIndexedDocuments(docs: DocumentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('nyra_docs_updated', { detail: docs }));
  } catch (e) {
    console.error('Failed to save indexed documents:', e);
  }
}

export function getAllChunks(): DocumentChunk[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHUNKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load chunks:', e);
    return [];
  }
}

export function saveAllChunks(chunks: DocumentChunk[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHUNKS_STORAGE_KEY, JSON.stringify(chunks));
  } catch (e) {
    console.error('Failed to save chunks:', e);
  }
}

/**
 * Index a document with exact page map or plain text.
 */
export function indexDocument(params: {
  name: string;
  text: string;
  size?: number;
  pages?: number;
  category?: string;
  pageMap?: DocumentPage[];
}): { document: DocumentRecord; chunks: DocumentChunk[] } {
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  let effectivePageMap = params.pageMap;
  if ((!effectivePageMap || effectivePageMap.length === 0) && params.text) {
    effectivePageMap = extractPageMapFromText(params.text);
  }

  let chunks: DocumentChunk[];
  if (effectivePageMap && effectivePageMap.length > 0) {
    chunks = chunkDocumentPages(effectivePageMap, params.name, docId);
  } else {
    chunks = chunkDocumentText(params.text, params.name, docId);
  }

  const calculatedPages = params.pages || (effectivePageMap && effectivePageMap.length > 0 ? effectivePageMap.length : Math.max(1, Math.ceil(params.text.length / 2000)));

  const newDoc: DocumentRecord = {
    id: docId,
    name: params.name,
    size: params.size || params.text.length,
    pages: calculatedPages,
    extractedText: params.text,
    pageMap: effectivePageMap,
    chunksCount: chunks.length,
    indexedAt: new Date().toISOString(),
    category: params.category || 'General',
    summary: params.text.slice(0, 160).replace(/\n/g, ' ') + '...',
  };

  const existingDocs = getIndexedDocuments().filter((d) => d.name !== params.name);
  saveIndexedDocuments([newDoc, ...existingDocs]);

  // Clean out any old chunks from this document name and save new chunks
  const existingChunks = getAllChunks().filter((c) => c.documentName !== params.name);
  saveAllChunks([...chunks, ...existingChunks]);

  return { document: newDoc, chunks };
}

/**
 * Delete a document and its indexed chunks.
 */
export function deleteDocument(docId: string): boolean {
  const docs = getIndexedDocuments().filter((d) => d.id !== docId);
  saveIndexedDocuments(docs);

  const chunks = getAllChunks().filter((c) => c.documentId !== docId);
  saveAllChunks(chunks);

  return true;
}

/**
 * Get chunks belonging to a specific document.
 */
export function getChunksForDocument(docId: string): DocumentChunk[] {
  return getAllChunks().filter((c) => c.documentId === docId);
}

// ----------------------------------------------------
// HYBRID RETRIEVAL (PAGE TARGETING + SEMANTIC + LEXICAL)
// ----------------------------------------------------

const QUERY_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'page', 'pages', 'pg',
  'document', 'doc', 'tell', 'show', 'give', 'explain', 'summarize', 'find', 'information', 'content',
  'what is on', 'what does', 'what are', 'say', 'says',
]);

/**
 * Compute keyword and entity match score between query and chunk.
 * Rewards exact keywords, numbers, uppercase acronyms, and consecutive phrases.
 */
function computeLexicalScore(query: string, chunkText: string): { score: number; matchCount: number; queryTermCount: number } {
  if (!query || !chunkText) return { score: 0, matchCount: 0, queryTermCount: 0 };

  const lowerChunk = chunkText.toLowerCase();
  const rawTerms = query
    .toLowerCase()
    .replace(/[^\w\s$%.-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const salientTerms = rawTerms.filter((t) => !QUERY_STOP_WORDS.has(t));
  const termsToSearch = salientTerms.length > 0 ? salientTerms : rawTerms;

  if (termsToSearch.length === 0) return { score: 0, matchCount: 0, queryTermCount: 0 };

  let matchCount = 0;
  let weightedScore = 0;

  for (const term of termsToSearch) {
    if (lowerChunk.includes(term)) {
      matchCount += 1;
      const isNumberOrMetric = /[\d$%.-]/.test(term);
      const isLongWord = term.length > 5;
      const termWeight = isNumberOrMetric ? 1.5 : (isLongWord ? 1.2 : 1.0);
      weightedScore += termWeight;
    }
  }

  // Bonus for exact multi-word phrase matching (2+ words)
  if (termsToSearch.length >= 2) {
    for (let i = 0; i < termsToSearch.length - 1; i++) {
      const phrase = `${termsToSearch[i]} ${termsToSearch[i + 1]}`;
      if (lowerChunk.includes(phrase)) {
        weightedScore += 1.5;
      }
    }
  }

  const normalizedScore = Math.min(1.0, weightedScore / Math.max(1, termsToSearch.length));
  return { score: normalizedScore, matchCount, queryTermCount: termsToSearch.length };
}

/**
 * Search and retrieve the most relevant chunks:
 * 1. For page-targeted questions (e.g. "What is on page 40?"), extracts and returns the EXACT text of that page.
 *    NEVER performs semantic search or injects unrelated chunks from other pages.
 * 2. For general questions, combines dense vector cosine similarity with lexical scoring.
 * 3. Logs detailed diagnostics for verification.
 */
export function searchSimilarChunks(
  query: string,
  options: {
    documentId?: string;
    document?: DocumentRecord;
    topK?: number;
    minScore?: number;
    chunks?: DocumentChunk[];
  } = {}
): SearchResultChunk[] {
  const topK = options.topK || 6;
  const minScore = options.minScore !== undefined ? options.minScore : 0.18;

  if (!query || !query.trim()) return [];

  const targetPages = extractTargetPageNumbers(query);

  // Resolve active document record if available
  let activeDoc = options.document;
  if (!activeDoc && options.documentId) {
    activeDoc = getIndexedDocuments().find((d) => d.id === options.documentId);
  }

  // 1. PAGE-SPECIFIC QUERY: Exact Page Retrieval Priority
  if (targetPages.length > 0) {
    const pageResults: SearchResultChunk[] = [];

    for (const pageNum of targetPages) {
      // First try extracting exact page text directly from DocumentRecord or pageMap
      let exactText = '';
      let docName = activeDoc?.name || 'Document';
      let docId = activeDoc?.id || options.documentId || 'doc_current';

      if (activeDoc) {
        const extracted = extractExactPageText(activeDoc, pageNum);
        if (extracted.found && extracted.text) {
          exactText = extracted.text;
        }
      }

      // If not found in DocumentRecord, check in memory chunks
      if (!exactText) {
        const allChunks = options.chunks || (options.documentId ? getChunksForDocument(options.documentId) : getAllChunks());
        const matchingChunks = allChunks.filter((c) => c.pageNumber === pageNum);
        if (matchingChunks.length > 0) {
          docName = matchingChunks[0].documentName;
          docId = matchingChunks[0].documentId;
          exactText = matchingChunks.map((c) => c.text).join('\n\n');
        }
      }

      if (exactText && exactText.trim().length > 0) {
        pageResults.push({
          chunk: {
            id: `chunk_${docId}_p${pageNum}_exact`,
            documentId: docId,
            documentName: docName,
            chunkIndex: 0,
            totalChunks: 1,
            text: exactText.trim(),
            pageNumber: pageNum,
            embedding: [],
            charCount: exactText.length,
          },
          score: 1.0,
          isPageMatch: true,
          citationLabel: `[Document: ${docName} | Page ${pageNum} | Exact Page Retrieval]`,
        });
      }
    }

    // Debug logging
    console.log(`[NYRA RAG RETRIEVAL]`, {
      query,
      detectedExplicitPage: targetPages.join(', '),
      retrievedPages: pageResults.map((r) => r.chunk.pageNumber),
      source: 'Exact page retrieval',
      retrievedTextPreview: pageResults.map((r) => `[Page ${r.chunk.pageNumber}]: ${r.chunk.text.slice(0, 100)}...`),
    });

    // Return ONLY exact page results. Do NOT perform semantic search or add unrelated pages.
    return pageResults;
  }

  // 2. GENERAL QUERY: Hybrid Vector Cosine + Lexical Token Scoring
  const allAvailableChunks = options.chunks || (options.documentId ? getChunksForDocument(options.documentId) : getAllChunks());
  if (allAvailableChunks.length === 0) return [];

  const queryEmbedding = generateEmbedding(query);
  const scoredResults: SearchResultChunk[] = [];

  for (const chunk of allAvailableChunks) {
    const vectorScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    const lexical = computeLexicalScore(query, chunk.text);

    let hybridScore = vectorScore * 0.60 + lexical.score * 0.40;

    if (lexical.matchCount >= 2 || (lexical.queryTermCount === 1 && lexical.matchCount === 1)) {
      hybridScore += 0.08;
    }

    const finalScore = Math.round(Math.min(1.0, hybridScore) * 100) / 100;

    if (finalScore >= minScore) {
      scoredResults.push({
        chunk,
        score: finalScore,
        isPageMatch: false,
        citationLabel: `[Document: ${chunk.documentName} | Page ${chunk.pageNumber} | Chunk ${chunk.chunkIndex + 1}/${chunk.totalChunks}]`,
      });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);
  const finalResults = scoredResults.slice(0, topK);

  // Debug logging
  console.log(`[NYRA RAG RETRIEVAL]`, {
    query,
    detectedExplicitPage: 'None (General Search)',
    retrievedPages: finalResults.map((r) => r.chunk.pageNumber),
    source: 'Hybrid semantic search',
    retrievedTextPreview: finalResults.map((r) => `[Page ${r.chunk.pageNumber}]: ${r.chunk.text.slice(0, 100)}...`),
  });

  return finalResults;
}

/**
 * Format retrieved search results into structured, grounded context for AI prompts.
 */
export function formatChunksForRAGPrompt(results: SearchResultChunk[]): string {
  if (results.length === 0) return '';

  const distinctPages = Array.from(new Set(results.map((r) => r.chunk.pageNumber))).sort((a, b) => a - b);
  const distinctDocs = Array.from(new Set(results.map((r) => r.chunk.documentName)));

  const blocks = results.map((r) => {
    return `--- BEGIN EXCERPT [Document: "${r.chunk.documentName}" | Page: ${r.chunk.pageNumber} | Section: ${r.chunk.chunkIndex + 1}] ---
${r.chunk.text}
--- END EXCERPT ---`;
  });

  return `=== RETRIEVED DOCUMENT CONTEXT (GROUND TRUTH) ===
Referenced Document(s): "${distinctDocs.join(', ')}"
Referenced Page(s): ${distinctPages.join(', ')}

${blocks.join('\n\n')}
==================================================`;
}

