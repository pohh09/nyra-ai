/**
 * Converts AI Markdown text into clean, human-friendly text for SpeechSynthesis.
 * Removes code blocks, URLs, markdown symbols, asterisks, headings, and formatting artifacts.
 */
export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // 1. Remove fenced code blocks (```lang ... ```)
  text = text.replace(/```[\s\S]*?```/g, ' [Code snippet omitted] ');

  // 2. Remove inline code (`...`)
  text = text.replace(/`([^`]+)`/g, '$1');

  // 3. Remove markdown links ([text](url) -> text)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 4. Remove raw URLs
  text = text.replace(/https?:\/\/\S+/g, '');

  // 5. Remove markdown headers (# Title -> Title)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 6. Remove bold, italics, strikethrough (***bold/italic*** -> text, **bold** -> text, *italic* -> text, ~~del~~ -> text)
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/___([^_]+)___/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // 7. Remove blockquotes (> quote)
  text = text.replace(/^>\s+/gm, '');

  // 8. Remove list markers (*, -, +, 1.)
  text = text.replace(/^[\*\-\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 9. Remove horizontal rules (---, ***, ___)
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // 10. Remove HTML tags (<tag> -> empty)
  text = text.replace(/<[^>]+>/g, '');

  // 11. Normalize excessive whitespace and line breaks
  text = text.replace(/\n{2,}/g, '. ');
  text = text.replace(/\n/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

/**
 * Splits long text into manageable sentence chunks (around 150-200 chars max)
 * so SpeechSynthesis handles long text smoothly across all browser engines.
 */
export function splitTextIntoSpeechChunks(text: string, maxChunkLength = 180): string[] {
  if (!text) return [];

  // Match sentences ending in punctuation or clause boundaries
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 <= maxChunkLength) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      // If a single sentence is excessively long, split by commas or words
      if (trimmed.length > maxChunkLength) {
        const words = trimmed.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if (wordChunk.length + word.length + 1 <= maxChunkLength) {
            wordChunk = wordChunk ? `${wordChunk} ${word}` : word;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
        else currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}
