/**
 * Automated Regression Test Suite: Protected Multimodal Pipeline (PDF + Vision)
 * Run with: npx tsx tests/multimodal.test.ts
 */

import {
  normalizeAttachments,
  extractDocumentContext,
  extractImageContext,
  ChatAttachment,
} from '../lib/multimodal/contract';
import {
  getModelConfig,
  validateModelCapabilities,
  USER_FACING_MODELS,
  AI_MODELS,
} from '../lib/ai/models';
import { calculateDynamicTokenBudget } from '../lib/ai/streamResolver';
import { ChatMessage } from '../lib/ai/types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` - ${details}` : ''}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING NYRA PROTECTED MULTIMODAL PIPELINE TESTS');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // TEST 1: Normal Text Request Contract
  // ---------------------------------------------------------
  console.log('--- Test 1: Normal Text Request Contract ---');
  const sampleMessages: ChatMessage[] = [
    { role: 'user', content: 'Hello Nyra, what is the capital of France?' },
  ];
  const budgetNormal = calculateDynamicTokenBudget({
    provider: 'groq',
    modelId: 'llama-3.1-8b-instant',
    systemPrompt: 'You are Nyra AI.',
    messages: sampleMessages,
  });
  assert(budgetNormal.estimatedInputTokens > 0, 'Estimated input tokens calculated correctly');
  assert(budgetNormal.maxOutputTokens >= 2048, 'Guaranteed healthy output tokens reserved for normal chat');

  // ---------------------------------------------------------
  // TEST 2: PDF Document Pipeline & Context Injection
  // ---------------------------------------------------------
  console.log('\n--- Test 2: PDF Document Pipeline ---');
  const mockPdfs: ChatAttachment[] = [
    {
      id: 'pdf-1',
      type: 'pdf',
      name: 'Resume_Pooja.pdf',
      extractedText: 'Pooja - Senior Software Engineer. Graduated with MS in Computer Science in 2024. Expertise in TypeScript and AI architectures.',
      pageCount: 2,
    },
    {
      id: 'pdf-2',
      type: 'pdf',
      name: 'Architecture_Plan.pdf',
      extractedText: 'System Design: Next.js 15 App Router with Supabase and Edge stream resolution.',
      pageCount: 1,
    },
  ];

  const normalized = normalizeAttachments(mockPdfs);
  assert(normalized.length === 2, 'Normalized 2 PDF attachments');
  assert(normalized[0].name === 'Resume_Pooja.pdf', 'Preserved PDF 1 metadata');

  const docContext = extractDocumentContext(normalized);
  assert(docContext.docNames.includes('Resume_Pooja.pdf'), 'Extracted Document 1 name');
  assert(docContext.docNames.includes('Architecture_Plan.pdf'), 'Extracted Document 2 name');
  assert(docContext.totalPages === 3, 'Calculated total page count');
  assert(docContext.pdfText.includes('MS in Computer Science in 2024'), 'Extracted actual document text content');

  // ---------------------------------------------------------
  // TEST 3: Vision Image Pipeline & Formatting
  // ---------------------------------------------------------
  console.log('\n--- Test 3: Vision Image Pipeline ---');
  const mockImageAttachment: ChatAttachment = {
    id: 'img-1',
    type: 'image',
    name: 'diagram.png',
    imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };

  const normalizedImages = normalizeAttachments([mockImageAttachment]);
  const extractedImages = extractImageContext(normalizedImages);
  assert(extractedImages.length === 1, 'Extracted 1 image data payload');
  assert(extractedImages[0].startsWith('data:image/png;base64,'), 'Image data URL format preserved');

  // Verify vision-capable model recognizes vision support
  const balancedConfig = getModelConfig('balanced');
  assert(balancedConfig.supportsVision === true, 'Balanced model declared vision support');

  // ---------------------------------------------------------
  // TEST 4: Unsupported Model Rejection
  // ---------------------------------------------------------
  console.log('\n--- Test 4: Unsupported Model Rejection ---');
  const fastValidation = validateModelCapabilities('fast', { hasImages: true });
  assert(fastValidation.valid === false, 'Text-only model (Fast) rejected image request');
  assert(Boolean(fastValidation.error), 'Clear error message returned for unsupported image request');
  assert(fastValidation.suggestedModelId === 'balanced', 'Suggested vision-capable fallback model');

  const advancedValidation = validateModelCapabilities('advanced', { hasImages: true });
  assert(advancedValidation.valid === false, 'Text-only model (Advanced) rejected image request');

  const balancedValidation = validateModelCapabilities('balanced', { hasImages: true });
  assert(balancedValidation.valid === true, 'Vision-capable model (Balanced) accepted image request');

  // ---------------------------------------------------------
  // TEST 5: Large PDF Context Budgeting (No 413 Errors)
  // ---------------------------------------------------------
  console.log('\n--- Test 5: Large PDF Context Budgeting ---');
  const largeDocumentText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(1500); // ~85,000 chars
  const largeMessages: ChatMessage[] = [
    {
      role: 'user',
      content: `[ATTACHED DOCUMENT CONTEXT: LargeReport.pdf]\n${largeDocumentText.slice(0, 15000)}\n\n[USER REQUEST]\nSummarize the key findings.`,
    },
  ];

  const groqBudget = calculateDynamicTokenBudget({
    provider: 'groq',
    modelId: 'qwen/qwen3.6-27b',
    systemPrompt: 'You are Nyra AI.',
    messages: largeMessages,
  });

  const totalGroqTokens = groqBudget.estimatedInputTokens + groqBudget.maxOutputTokens;
  assert(
    totalGroqTokens <= 7800,
    `Groq total token budget (${totalGroqTokens}) fits safely within 8000 TPM limit to prevent 413 errors`
  );
  assert(groqBudget.maxOutputTokens >= 1536, 'Groq output reserve is at least 1536 tokens');

  const geminiBudget = calculateDynamicTokenBudget({
    provider: 'gemini',
    modelId: 'gemini-3.6-flash',
    systemPrompt: 'You are Nyra AI.',
    messages: largeMessages,
  });
  assert(geminiBudget.maxOutputTokens === 8192, 'Gemini allocates full 8192 output tokens for large context');
  assert(geminiBudget.maxPdfChars === 160000, 'Gemini accommodates massive document context');

  // ---------------------------------------------------------
  // TEST 6: All Models Catalog Integrity
  // ---------------------------------------------------------
  console.log('\n--- Test 6: Model Catalog Integrity ---');
  for (const model of AI_MODELS) {
    assert(Boolean(model.id), `Model has valid ID: ${model.id}`);
    assert(Boolean(model.provider), `Model has provider: ${model.provider}`);
    assert(model.supportsPdf === true, `Model supports PDF document context: ${model.name}`);
    assert(model.supportsText === true, `Model supports text: ${model.name}`);
    assert(typeof model.supportsVision === 'boolean', `Model explicitly declares vision support: ${model.name}`);
    assert(typeof model.capabilities?.streaming === 'boolean', `Model explicitly declares streaming: ${model.name}`);
  }

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} MULTIMODAL PIPELINE TESTS PASSED!`);
  console.log('======================================================\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Multimodal Test Suite Failed:\n', err);
  process.exit(1);
});
