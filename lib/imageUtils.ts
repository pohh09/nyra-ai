/**
 * Image processing & compression utilities for multimodal AI chats.
 * Resizes large camera photos/screenshots to optimal dimensions and compresses
 * to efficient JPEG/WEBP data URLs to prevent token/payload limits and 413 errors.
 */

export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    // If SVG or tiny file, read directly
    if (file.type === 'image/svg+xml' || file.size < 100 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          resolve(e.target?.result as string || '');
        }
      };
      img.onerror = () => resolve(e.target?.result as string || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
