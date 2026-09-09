import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  charCount: number;
}

export interface ExtractedPdfResult {
  text: string;
  pages: number;
  pageMap: DocumentPage[];
}

export async function extractPdfText(file: File): Promise<ExtractedPdfResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: "https://unpkg.com/pdfjs-dist@4.10.38/cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "https://unpkg.com/pdfjs-dist@4.10.38/standard_fonts/",
    });

    const pdf = await loadingTask.promise;

    if (!pdf || pdf.numPages === 0) {
      throw new Error("This PDF document contains no pages.");
    }

    let text = "";
    const pageMap: DocumentPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pageMap.push({
        pageNumber: i,
        text: pageText,
        charCount: pageText.length,
      });

      if (pageText) {
        text += `[Page ${i} of ${pdf.numPages}]\n${pageText}\n\n`;
      } else {
        text += `[Page ${i} of ${pdf.numPages}]\n(No readable text on this page)\n\n`;
      }
    }

    if (!text.trim()) {
      throw new Error("This PDF doesn't contain readable text.");
    }

    return {
      text: text.trim(),
      pages: pdf.numPages,
      pageMap,
    };
  } catch (err: any) {
    if (
      err?.name === "PasswordException" ||
      err?.message?.toLowerCase().includes("password") ||
      err?.message?.toLowerCase().includes("encrypted")
    ) {
      throw new Error("This PDF is password protected and cannot be processed.");
    }

    if (err?.message === "This PDF doesn't contain readable text." || err?.message === "This PDF document contains no pages.") {
      throw err;
    }

    console.error("PDFJS parsing error:", err);
    throw new Error(err?.message || "Failed to parse PDF. The file may be corrupted or invalid.");
  }
}