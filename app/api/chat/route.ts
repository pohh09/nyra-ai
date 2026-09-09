import { tavily } from '@tavily/core';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage } from '@/lib/usage/usageService';
import {
  resolveAIStream,
  calculatePdfContextBudget,
  sanitizeAndTrimConversationHistory,
} from '@/lib/ai/streamResolver';
import { getModelConfig, validateModelCapabilities, resolveActiveModelConfig } from '@/lib/ai/models';
import {
  normalizeAttachments,
  extractDocumentContext,
  extractImageContext,
  ChatAttachment,
} from '@/lib/multimodal/contract';
import {
  chunkDocumentText,
  searchSimilarChunks,
  formatChunksForRAGPrompt,
} from '@/lib/services/ragService';

const tvly = process.env.TAVILY_API_KEY
  ? tavily({
      apiKey: process.env.TAVILY_API_KEY,
    })
  : null;

function fitContextToBudget(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) return text;

  const headLength = Math.floor(maxChars * 0.65);
  const tailLength = Math.floor(maxChars * 0.35);

  const head = text.slice(0, headLength);
  const tail = text.slice(-tailLength);

  return `${head}\n\n[... Document sections (${text.length - maxChars} chars) truncated ...]\n\n${tail}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body?.messages || [];
    const pdfText = body?.pdfText || '';
    const isDeepResearch = body?.deepResearch === true || body?.mode === 'research';
    const webSearch = body?.webSearch || isDeepResearch || false;
    const mode = isDeepResearch ? 'research' : (body?.mode || 'default');
    const projectInstructions = body?.projectInstructions || '';
    const workspaceNotes = body?.workspaceNotes || '';
    const selectedModelId = body?.modelId || body?.model || 'balanced';
    const rawAttachments: any[] = body?.attachments || [];
    const pdfDocuments: any[] = body?.pdfDocuments || [];
    const workspaceFiles: any[] = body?.workspaceFiles || [];
    const userMemories: string = body?.userMemories || '';

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('No messages provided.', { status: 400 });
    }

    // Normalize incoming attachments through unified contract
    const normalizedAttachments: ChatAttachment[] = normalizeAttachments(rawAttachments);

    const hasImages =
      messages.some((m: any) => m.image || (Array.isArray(m.images) && m.images.length > 0)) ||
      normalizedAttachments.some((a) => a.type === 'image' || a.imageData);

    console.log("Gemini configured:", Boolean(process.env.GEMINI_API_KEY));

    // Resolve model configuration with vision capability awareness
    const modelConfig = resolveActiveModelConfig(selectedModelId, hasImages);
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

    // Pre-flight capability validation: check image analysis support
    if (hasImages && !modelConfig.supportsVision) {
      return new Response(
        `No active vision-capable AI provider is configured in your environment. Please ensure GEMINI_API_KEY or OPENAI_API_KEY is configured.`,
        { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    // Authenticate user session for server-side usage checks
    const supabase = await createSupabaseServerClient();
    let userId: string | null = null;
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    const hasPdfs = Boolean(
      pdfText ||
      normalizedAttachments.length > 0 ||
      pdfDocuments.length > 0 ||
      workspaceFiles.length > 0
    );

    // 1. Check AI Request Limit
    const aiCheck = await checkAndIncrementUsage(supabase, userId, 'aiRequests', 1);
    if (!aiCheck.allowed) {
      return new Response(
        `Daily AI request limit reached (${aiCheck.limit}/${aiCheck.limit}). Your allowance resets at 00:00 UTC.`,
        { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    // 2. Check Web Search Limit if enabled
    if (webSearch) {
      const webCheck = await checkAndIncrementUsage(supabase, userId, 'webSearches', 1);
      if (!webCheck.allowed) {
        return new Response(
          `Daily Web Search limit reached (${webCheck.limit}/${webCheck.limit}). Your allowance resets at 00:00 UTC.`,
          { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    }

    // 3. Check Image Request Limit if images present
    if (hasImages) {
      const imgCheck = await checkAndIncrementUsage(supabase, userId, 'imageRequests', 1);
      if (!imgCheck.allowed) {
        return new Response(
          `Daily image analysis limit reached (${imgCheck.limit}/${imgCheck.limit}). Your allowance resets at 00:00 UTC.`,
          { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    }

    // 4. Check PDF Request Limit if PDF present
    if (hasPdfs) {
      const pdfCheck = await checkAndIncrementUsage(supabase, userId, 'pdfRequests', 1);
      if (!pdfCheck.allowed) {
        return new Response(
          `Daily PDF document analysis limit reached (${pdfCheck.limit}/${pdfCheck.limit}). Your allowance resets at 00:00 UTC.`,
          { status: 429, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        );
      }
    }

    // 🌐 Web Search using Tavily if enabled
    let webContext = '';
    let webSources: { title: string; url: string; domain?: string; snippet?: string }[] = [];

    if (webSearch && tvly && lastUserMessage?.content) {
      try {
        const search = await tvly.search(lastUserMessage.content, {
          maxResults: 5,
          searchDepth: 'advanced',
        });

        webSources = search.results.map((r: any) => {
          let domain = '';
          try {
            domain = new URL(r.url).hostname.replace(/^www\./, '');
          } catch {
            domain = r.url;
          }
          return {
            title: r.title,
            url: r.url,
            domain,
            snippet: r.content?.slice(0, 180) || '',
          };
        });

        webContext = search.results
          .map(
            (r: any, i: number) =>
              `[${i + 1}] Title: ${r.title}\nSource URL: ${r.url}\nContent: ${r.content}`
          )
          .join('\n\n');
      } catch (searchErr) {
        console.error('Tavily search error:', searchErr);
      }
    }

    // Prepare system messages
    const systemPrompts: string[] = [
      'You are Nyra AI, an intelligent, high-capability AI workspace assistant designed for reasoning, research, deep coding, and creative problem solving.',
    ];

    if (projectInstructions) {
      systemPrompts.push(`
=== PROJECT WORKSPACE CONTEXT & INSTRUCTIONS ===
${projectInstructions}
================================================
Ensure your answers align strictly with the project instructions and context above.
`);
    }

    const isContinuation = body?.isContinuation || false;
    const partialResponse = body?.partialResponse || '';

    if (isContinuation && partialResponse) {
      systemPrompts.push(`
=== CONTINUATION INSTRUCTION ===
The assistant started generating the following partial response:
"${partialResponse.slice(-1500)}"

Please continue generating the remaining answer seamlessly from where it stopped. Do NOT repeat any previous words or start with introductory phrases. Continue with the next immediate sentence or code block.
================================
`);
    }

    if (mode === 'document_qa') {
      systemPrompts.push(`
=== STRICT DOCUMENT GROUNDING MODE ===
You are an authoritative, beginner-friendly Document Assistant.
Your responsibility is to provide 100% accurate, factual answers derived exclusively from the provided document excerpts.

RESPONSE STRUCTURE REQUIREMENTS:
When answering questions about a document, structure your response cleanly:

## Quick Answer
Provide a short, direct answer in 2-4 sentences giving immediate clarity.

## Key Points
### 1. First Important Point
Explain clearly in simple terms.
- Supporting detail
- Supporting detail

### 2. Second Important Point
Explain clearly in simple terms.
- Supporting detail
- Supporting detail

## Important Details
Include any useful additional information, context, or actionable tips.

## Source
Page X

STRICT ACCURACY & FORMATTING RULES:
1. ONLY use the explicit facts, figures, metrics, dates, and statements present in the document context.
2. NEVER guess, extrapolate, speculate, or introduce outside knowledge.
3. If the document excerpts do not answer the question or lack sufficient details, state clearly: "The provided document does not contain information to answer this question."
4. If asked about a specific page (e.g. Page 13 or Page 80), state only what is explicitly written on that page.
5. Do NOT repeat the page number (e.g., do NOT write "[Page X]") throughout the body text or after each bullet.
6. Do NOT include raw metadata, chunk tags, or internal markers inside the main response.
7. Use simple, scannable, beginner-friendly language.
======================================
`);
    }

    if (mode === 'code') {
      systemPrompts.push(`
=== CODE ASSISTANT SPECIALIZATION ===
- Provide clean, robust, modern, production-grade code with TypeScript types where applicable.
- Use best practices, modular structures, and concise explanatory markdown.
- Include comments for complex logic.
`);
    }

    if (mode === 'research' || isDeepResearch) {
      systemPrompts.push(`
=== DEEP RESEARCH MODE ACTIVATED ===
You are executing in Nyra Deep Research mode. Conduct an exhaustive, highly structured, multi-dimensional investigation of the user's prompt.
Your response MUST be an in-depth, authoritative research synthesis:
1. **Executive Summary**: High-level synthesis of key findings, core answer, and strategic significance.
2. **Comprehensive Findings & Core Analysis**: Break down mechanisms, historical and current developments, technical architectures, or deep concepts with precision.
3. **Comparative Evaluation & Trade-offs**: Contrast methodologies, tools, competing schools of thought, or benchmark metrics in clear structured tables/breakdowns.
4. **Key Challenges, Nuances & Limitations**: Highlight practical roadblocks, edge cases, risks, and counterarguments.
5. **Actionable Roadmap & Strategic Recommendations**: Step-by-step guidance, actionable advice, and best practices.
6. **Sources & Verified Reference Points**: Cite data points, publications, and verified facts throughout your analysis.

Format using clean, modern Markdown with bold headings, structured comparison tables, bullet points, and insightful callouts.
====================================
`);
    }

    if (workspaceNotes && workspaceNotes.trim()) {
      systemPrompts.push(`
=== WORKSPACE NOTES & CONTEXT ===
${workspaceNotes.trim()}
=================================
`);
    }

    if (userMemories && userMemories.trim()) {
      systemPrompts.push(`
=== STORED USER MEMORIES & PREFERENCES ===
${userMemories.trim()}
==========================================
`);
    }

    // Extract PDF text and document names using unified multimodal extractor
    const docContext = extractDocumentContext(normalizedAttachments, pdfText, pdfDocuments);
    let combinedPdfText = docContext.pdfText;
    const docNames: string[] = [...docContext.docNames];

    // Also include workspace documents if present
    if (workspaceFiles.length > 0 && !combinedPdfText) {
      const workspaceParts = workspaceFiles
        .filter((f) => f.text || f.extractedText)
        .map((f, i) => {
          if (f.name && !docNames.includes(f.name)) docNames.push(f.name);
          return `--- [Workspace Document ${i + 1}: ${f.name || 'Document'}] (${f.pages || 1} pages) ---\n${f.text || f.extractedText}`;
        });
      if (workspaceParts.length > 0) {
        combinedPdfText = workspaceParts.join('\n\n');
      }
    }

    // For follow-up questions: if no new document was attached on this request, retrieve previously uploaded document context EXACTLY ONCE
    if (!combinedPdfText && Array.isArray(messages)) {
      for (const m of messages) {
        if (m.pdfName && !docNames.includes(m.pdfName)) {
          docNames.push(m.pdfName);
        }
        if (Array.isArray(m.attachments)) {
          for (const a of m.attachments) {
            if (a.name && !docNames.includes(a.name)) {
              docNames.push(a.name);
            }
          }
        }

        if (!combinedPdfText) {
          if (m.pdfContext && m.pdfContext.trim()) {
            combinedPdfText = m.pdfContext.trim();
          } else if (Array.isArray(m.attachments)) {
            const attText = m.attachments.map((a: any) => a.extractedText).filter(Boolean).join('\n\n');
            if (attText && attText.trim()) {
              combinedPdfText = attText.trim();
            }
          }
        }
      }
    }

    const lastUserIdx = messages.map((m: any) => m.role).lastIndexOf('user');
    const rawUserPrompt = lastUserMessage?.content || '';
    const cleanUserPrompt = rawUserPrompt.replace(/\[ATTACHED DOCUMENT CONTEXT:[^\]]*\][\s\S]*?\[USER REQUEST\]\s*/gi, '').trim() || 'Please analyze and summarize the attached document.';

    // Sanitize & trim conversation history so older messages do not grow indefinitely or contain duplicate document blocks
    const rawHistory = messages.slice(0, lastUserIdx >= 0 ? lastUserIdx : 0);
    const sanitizedHistory = sanitizeAndTrimConversationHistory(rawHistory, 4000);

    // Calculate dynamic available PDF budget based on:
    // Model limit - System prompt - Sanitized history - User message - Output token reserve
    const pdfBudget = calculatePdfContextBudget({
      provider: modelConfig.provider,
      systemPrompt: systemPrompts.join('\n\n'),
      historyMessages: sanitizedHistory,
      userPrompt: cleanUserPrompt,
    });

    const docLabel = docNames.length > 0 ? docNames.join(', ') : 'Attached Document';

    // For large documents exceeding budget, perform intelligent RAG chunk retrieval
    // preserving exact page targets and semantic relevance rather than naive head/tail truncation
    let fittedPdfText = '';
    if (combinedPdfText) {
      if (combinedPdfText.length <= pdfBudget.maxPdfChars) {
        fittedPdfText = combinedPdfText;
      } else {
        const chunks = chunkDocumentText(combinedPdfText, docLabel, 'chat_attachment');
        const retrieved = searchSimilarChunks(cleanUserPrompt, { chunks, topK: 10 });
        if (retrieved.length > 0) {
          fittedPdfText = formatChunksForRAGPrompt(retrieved);
        } else {
          fittedPdfText = fitContextToBudget(combinedPdfText, pdfBudget.maxPdfChars);
        }
      }
    }

    const activeImages = extractImageContext(
      lastUserMessage?.attachments,
      lastUserMessage?.image,
      lastUserMessage?.images
    );
    for (const att of normalizedAttachments) {
      if ((att.type === 'image' || att.imageData) && att.imageData && !activeImages.includes(att.imageData)) {
        activeImages.push(att.imageData);
      }
    }

    const finalUserPrompt =
      cleanUserPrompt ||
      (activeImages.length > 0
        ? 'Please carefully analyze and describe what you see in the attached image(s).'
        : 'Please analyze and summarize the attached document.');

    // Construct clean user turn containing the single document context block
    const activeUserTurn = {
      ...lastUserMessage,
      role: 'user',
      image: activeImages[0] || undefined,
      images: activeImages.length > 0 ? activeImages : undefined,
      content: fittedPdfText
        ? `[ATTACHED DOCUMENT CONTEXT: ${docLabel}]\n${fittedPdfText}\n\n[USER REQUEST]\n${finalUserPrompt}`
        : finalUserPrompt,
    };

    const formattedMessages = [...sanitizedHistory, activeUserTurn];

    if (activeImages.length > 0) {
      systemPrompts.push(`
=== MULTIMODAL VISION INSTRUCTION ===
One or more images are attached to the active user prompt.
You have direct visual capability to analyze all details, text (OCR), colors, objects, diagrams, charts, UI elements, and contents of the image(s).
Provide an insightful, accurate, and detailed analysis based on what is visually present in the image(s).
======================================
`);
    }

    if (fittedPdfText) {
      systemPrompts.push(`
=== CRITICAL DOCUMENT ACCESS INSTRUCTION ===
The user has attached one or more documents (${docLabel}) whose full text is included directly in the user turn above.
You have FULL, DIRECT access to the document contents.
NEVER state or imply that you cannot read, parse, or access PDFs, documents, or files.
Answer all questions thoroughly and accurately using the provided document text.
Cite specific sections, tables, data, and page numbers when available.
============================================
`);
    }

    if (webContext) {
      const fittedWebContext = fitContextToBudget(webContext, 12000);
      systemPrompts.push(`
=== LIVE WEB SEARCH RESULTS ===
${fittedWebContext}
================================
Synthesize a comprehensive, up-to-date answer citing sources with bracketed numbers like [1], [2] corresponding to the numbered sources above. If the search results do not cover the question, clearly say so.
`);
    }

    // 🔍 Server-side Context Diagnostics
    let pdfOccurrenceCount = 0;
    if (fittedPdfText) {
      for (const m of formattedMessages) {
        if (m.content && m.content.includes(fittedPdfText)) {
          pdfOccurrenceCount++;
        }
      }
    }

    const historyCharCount = sanitizedHistory.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const finalPromptAndMessagesChars =
      systemPrompts.join('\n\n').length +
      formattedMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const estimatedTotalTokens = Math.ceil(finalPromptAndMessagesChars / 3.8);

    console.log('[CONTEXT TRACE]', {
      messageCount: formattedMessages.length,
      historyCharCount,
      pdfContextCharCount: fittedPdfText.length,
      pdfOccurrenceCount,
      estimatedTotalTokens,
      provider: modelConfig.provider,
      model: modelConfig.modelIdentifier,
    });

    return await resolveAIStream({
      modelId: selectedModelId,
      messages: formattedMessages,
      systemPrompt: systemPrompts.join('\n\n'),
      webSources,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(
      error?.message || 'An error occurred while generating the response.',
      { status: 500 }
    );
  }
}