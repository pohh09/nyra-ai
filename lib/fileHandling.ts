import { FileAttachment } from './types';

export const MAX_PDFS = 5;
export const MAX_PDFS_PER_MESSAGE = MAX_PDFS;
export const MAX_PDF_SIZE_MB = 20;
export const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

export const MAX_IMAGES = 4;
export const MAX_IMAGES_PER_MESSAGE = MAX_IMAGES;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validatePdfFile(file: File, currentCount: number): { valid: boolean; error?: string } {
  if (currentCount >= MAX_PDFS_PER_MESSAGE) {
    return {
      valid: false,
      error: `Maximum ${MAX_PDFS_PER_MESSAGE} PDF documents allowed per message.`,
    };
  }

  const isPdfType =
    file.type === 'application/pdf' ||
    file.type === 'application/x-pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfType) {
    return {
      valid: false,
      error: `"${file.name}" is not a valid PDF file.`,
    };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the ${MAX_PDF_SIZE_MB}MB size limit.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `"${file.name}" is an empty file.`,
    };
  }

  return { valid: true };
}

export function validateImageFile(file: File, currentCount: number): { valid: boolean; error?: string } {
  if (currentCount >= MAX_IMAGES_PER_MESSAGE) {
    return {
      valid: false,
      error: `Maximum ${MAX_IMAGES_PER_MESSAGE} images allowed per message.`,
    };
  }

  const isImageType =
    file.type.startsWith('image/') ||
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    ALLOWED_IMAGE_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

  if (!isImageType) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported image format. (PNG, JPG, WEBP, GIF, SVG).`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the ${MAX_IMAGE_SIZE_MB}MB size limit.`,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes attachments before persisting to localStorage to avoid QuotaExceededError.
 * Keeps metadata (id, name, type, size, pages, status) and strips large raw binary blobs and file references.
 */
export function sanitizeAttachmentForStorage(att: FileAttachment): FileAttachment {
  return {
    id: att.id,
    name: att.name,
    type: att.type,
    size: att.size,
    pages: att.pages,
    status: att.status === 'error' || att.status === 'failed' ? 'failed' : 'ready',
    errorMessage: att.errorMessage,
    url: att.url,
    extractedText: att.extractedText,
    dataUrl: att.dataUrl ? att.dataUrl.slice(0, 100) : undefined, // Truncate dataUrl in storage if any
    // Do not serialize heavy File objects in localStorage
  };
}
