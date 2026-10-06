const VECTOR_DIMENSIONS = 384;

function hashString(str: string, seed: number): number {
  let h = seed ^ 0xdeadbeef;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'that', 'this', 'these', 'those', 'it',
]);

export function generateEmbedding(text: string): number[] {
  const vector = new Array(VECTOR_DIMENSIONS).fill(0);
  if (!text || typeof text !== 'string') return vector;

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  if (words.length === 0) return vector;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const weight = 1 + Math.log(1 + 1 / (i + 1)); 

    const dim1 = hashString(word, 42) % VECTOR_DIMENSIONS;
    const dim2 = hashString(word, 1337) % VECTOR_DIMENSIONS;
    const dim3 = hashString(word, 8080) % VECTOR_DIMENSIONS;

    vector[dim1] += weight * 0.6;
    vector[dim2] += weight * 0.3;
    vector[dim3] += weight * 0.1;
  }

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]}_${words[i + 1]}`;
    const bDim = hashString(bigram, 9999) % VECTOR_DIMENSIONS;
    vector[bDim] += 0.8;
  }

  let norm = 0;
  for (let i = 0; i < VECTOR_DIMENSIONS; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIMENSIONS; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  return Math.max(0, Math.min(1, dotProduct));
}
