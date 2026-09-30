export type PdfKind = "profile" | "export" | "unknown";

// Signatures observed on real Verveware exports; classification never trusts filenames.
const PROFILE_SIGNATURES = ["Team Members", "DOH:"];
const EXPORT_SIGNATURES = ["Compliance Name", "Completion Date", "Renewal Date", "Actions"];

const countMatches = (text: string, signatures: string[]): number =>
  signatures.filter((signature) => text.includes(signature)).length;

export const classifyPdfText = (pageOneText: string): PdfKind => {
  const isProfile = countMatches(pageOneText, PROFILE_SIGNATURES) === PROFILE_SIGNATURES.length;
  const isExport =
    !pageOneText.includes("Team Members") && countMatches(pageOneText, EXPORT_SIGNATURES) >= 3;

  if (isProfile && !isExport) return "profile";
  if (isExport && !isProfile) return "export";
  return "unknown";
};
