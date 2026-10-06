export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  text = text.replace(/```[\s\S]*?```/g, ' [Code snippet omitted] ');

  text = text.replace(/`([^`]+)`/g, '$1');

  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  text = text.replace(/https?:\/\/\S+/g, '');

  text = text.replace(/^#{1,6}\s+/gm, '');

  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/___([^_]+)___/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');

  text = text.replace(/^>\s+/gm, '');

  text = text.replace(/^[\*\-\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  text = text.replace(/<[^>]+>/g, '');

  text = text.replace(/\n{2,}/g, '. ');
  text = text.replace(/\n/g, ' ');
  text = text.replace(/\s{2,}/g, ' ').trim();

  return text;
}

export function splitTextIntoSpeechChunks(text: string, maxChunkLength = 180): string[] {
  if (!text) return [];

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
