import { classifyPdfText } from "./classifier";
import { extractComplianceDates } from "./complianceExtractor";
import { extractAllPagesText, extractFirstPageText } from "./pdfText";
import { extractProfileFields } from "./profileExtractor";

export type PdfImportResult = {
  documentData: { participant?: string; hca?: string; supervisor?: string };
  dates: string[];
  fileRoles: { profileFileName: string | null; exportFileName: string | null };
  warnings: string[];
  errors: string[];
};

export const importFromPdfPair = async (
  files: File[],
  complianceRowName: string,
): Promise<PdfImportResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (files.length !== 2) {
    return {
      documentData: {},
      dates: [],
      fileRoles: { profileFileName: null, exportFileName: null },
      warnings,
      errors: ["Please upload exactly two PDF files: the profile export and the compliance export."],
    };
  }

  const classifications = await Promise.all(
    files.map(async (file) => ({ file, kind: classifyPdfText(await extractFirstPageText(file)) })),
  );

  const profileEntry = classifications.find((entry) => entry.kind === "profile");
  const exportEntry = classifications.find((entry) => entry.kind === "export");

  const fileRoles = {
    profileFileName: profileEntry?.file.name ?? null,
    exportFileName: exportEntry?.file.name ?? null,
  };

  if (!profileEntry || !exportEntry) {
    errors.push(
      "Could not tell which file is the profile page and which is the compliance export. " +
        "Please check that you uploaded one of each.",
    );
    return { documentData: {}, dates: [], fileRoles, warnings, errors };
  }

  const profileResult = extractProfileFields(await extractFirstPageText(profileEntry.file));
  if (!profileResult.success) {
    errors.push(...profileResult.errors);
  }

  const exportPages = await extractAllPagesText(exportEntry.file);
  const dates = extractComplianceDates(exportPages, complianceRowName);
  if (dates.length === 0) {
    warnings.push(`No "${complianceRowName}" rows with a Completion Date were found in the compliance export.`);
  }

  return {
    documentData: profileResult.success ? profileResult.fields : {},
    dates,
    fileRoles,
    warnings,
    errors,
  };
};
