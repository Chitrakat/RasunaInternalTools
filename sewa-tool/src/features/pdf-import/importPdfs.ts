import { classifyPdfText } from "./classifier";
import { extractComplianceDates } from "./complianceExtractor";
import { extractAllPagesText, extractFirstPageText } from "./pdfText";

export type ExportImportResult = {
  dates: string[];
  warnings: string[];
  errors: string[];
};

// Single-file flow: only the compliance export PDF is needed; names/supervisor are entered manually.
export const importFromExportPdf = async (
  file: File,
  complianceRowName: string,
): Promise<ExportImportResult> => {
  const warnings: string[] = [];
  const errors: string[] = [];

  const firstPageText = await extractFirstPageText(file);
  if (classifyPdfText(firstPageText) === "profile") {
    errors.push(
      "This looks like a caregiver profile PDF, not the compliance export. Please upload the compliance/export PDF instead.",
    );
    return { dates: [], warnings, errors };
  }

  const allPagesText = await extractAllPagesText(file);
  const dates = extractComplianceDates(allPagesText, complianceRowName);
  if (dates.length === 0) {
    warnings.push(`No "${complianceRowName}" rows with a Completion Date were found in this PDF.`);
  }

  return { dates, warnings, errors };
};

