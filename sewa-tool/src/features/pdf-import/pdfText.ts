// Browser-only PDF text extraction (pdfjs-dist). Never import this from server code.
import type { PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;

export const configurePdfWorker = async () => {
  if (workerConfigured) return;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  workerConfigured = true;
};

export const loadPdfDocument = async (file: File): Promise<PDFDocumentProxy> => {
  await configurePdfWorker();
  const pdfjs = await import("pdfjs-dist");
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  return loadingTask.promise;
};

const extractPageText = async (doc: PDFDocumentProxy, pageNumber: number): Promise<string> => {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
};

export const extractFirstPageText = async (file: File): Promise<string> => {
  const doc = await loadPdfDocument(file);
  try {
    return await extractPageText(doc, 1);
  } finally {
    await doc.destroy();
  }
};

export const extractAllPagesText = async (file: File): Promise<string[]> => {
  const doc = await loadPdfDocument(file);
  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      pages.push(await extractPageText(doc, pageNumber));
    }
    return pages;
  } finally {
    await doc.destroy();
  }
};
