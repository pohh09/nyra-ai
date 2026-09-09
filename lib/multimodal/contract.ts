/**
 * Unified Multimodal Attachment Contract
 * Single source of truth for attachments across UI, API, Stream Resolver, and AI Providers.
 */

export interface ChatAttachment {
  id: string;
  type: 'image' | 'pdf' | 'text' | 'file';
  name: string;
  mimeType?: string;
  size?: number;
  // For images (data URL, base64, or public URL)
  imageData?: string;
  // For PDFs & documents
  extractedText?: string;
  pageCount?: number;
}

export interface ExtractedDocumentContext {
  pdfText: string;
  docNames: string[];
  totalPages: number;
}

/**
 * Normalizes an array of raw attachment inputs into standard ChatAttachment objects.
 */
export function normalizeAttachments(rawList: any[]): ChatAttachment[] {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item, idx) => {
      if (!item) return null;

      const id = item.id || `att-${Date.now()}-${idx}`;
      const name = item.name || item.filename || 'Document';
      const type = item.type === 'image' || item.type === 'pdf' || item.type === 'text' ? item.type : (name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image');
      const mimeType = item.mimeType || (type === 'pdf' ? 'application/pdf' : 'image/jpeg');
      const size = typeof item.size === 'number' ? item.size : undefined;

      const imageData = item.imageData || item.dataUrl || item.url || (typeof item === 'string' && item.startsWith('data:image') ? item : undefined);
      const extractedText = item.extractedText || item.text || item.content || undefined;
      const pageCount = item.pageCount || item.pages || (extractedText ? 1 : undefined);

      return {
        id,
        type,
        name,
        mimeType,
        size,
        imageData,
        extractedText,
        pageCount,
      } as ChatAttachment;
    })
    .filter(Boolean) as ChatAttachment[];
}

/**
 * Extracts and concatenates all PDF/document text from attachments and legacy fields.
 */
export function extractDocumentContext(
  attachments?: ChatAttachment[],
  legacyPdfText?: string,
  legacyPdfDocuments?: any[]
): ExtractedDocumentContext {
  const docNames: string[] = [];
  const textParts: string[] = [];
  let totalPages = 0;

  if (Array.isArray(attachments)) {
    attachments
      .filter((a) => a.type === 'pdf' || a.extractedText)
      .forEach((a, i) => {
        if (a.name && !docNames.includes(a.name)) docNames.push(a.name);
        if (a.pageCount) totalPages += a.pageCount;
        if (a.extractedText && a.extractedText.trim()) {
          textParts.push(
            `--- [Document ${i + 1}: ${a.name || 'Document'}] (${a.pageCount || 1} pages) ---\n${a.extractedText.trim()}`
          );
        }
      });
  }

  if (Array.isArray(legacyPdfDocuments)) {
    legacyPdfDocuments.forEach((doc, i) => {
      const name = doc.name || `Document ${i + 1}`;
      if (name && !docNames.includes(name)) docNames.push(name);
      if (doc.pages) totalPages += doc.pages;
      const content = doc.text || doc.extractedText;
      if (content && content.trim() && !textParts.some((p) => p.includes(content.trim()))) {
        textParts.push(`--- [Document: ${name}] (${doc.pages || 1} pages) ---\n${content.trim()}`);
      }
    });
  }

  if (legacyPdfText && legacyPdfText.trim() && textParts.length === 0) {
    textParts.push(legacyPdfText.trim());
    if (docNames.length === 0) docNames.push('Attached Document');
    if (totalPages === 0) totalPages = 1;
  }

  return {
    pdfText: textParts.join('\n\n'),
    docNames,
    totalPages: Math.max(1, totalPages),
  };
}

/**
 * Extracts all image URLs/data from attachments and legacy fields.
 */
export function extractImageContext(
  attachments?: ChatAttachment[],
  legacyImage?: string,
  legacyImages?: string[]
): string[] {
  const images: string[] = [];

  if (legacyImage && !images.includes(legacyImage)) {
    images.push(legacyImage);
  }

  if (Array.isArray(legacyImages)) {
    legacyImages.forEach((img) => {
      if (img && !images.includes(img)) images.push(img);
    });
  }

  if (Array.isArray(attachments)) {
    attachments
      .filter((a) => a.type === 'image' || a.imageData)
      .forEach((a) => {
        if (a.imageData && !images.includes(a.imageData)) {
          images.push(a.imageData);
        }
      });
  }

  return images;
}
