import type { DocumentTemplateConfig } from "./types";

export const PHONE_CALL_LOG_TYPE = "Phone Call";
export const DEFAULT_OBJECTIVE_MET = true;

const firstName = (hcaName: string): string => hcaName.trim().split(/\s+/)[0] || "the HCA";

export const PURPOSE_TEMPLATES = {
  firstRow: (hcaName: string) =>
    `I called ${firstName(hcaName)} for the monthly check-in.\nHCA said everything is going well and will let me know if anything is needed.`,
  subsequentRow: (hcaName: string) =>
    `I completed the monthly check-in call with ${hcaName}.\nThe HCA reported all is going well and will reach out if support is needed.`,
};

export const DEFAULT_DATE_COLUMN_INDEX = 2;
export const DEFAULT_DOCUMENT_YEAR = "2025";

export const monthlyDocumentConfig: DocumentTemplateConfig = {
  title: "Monthly Phone Monitoring",
  templateUrl: "/template/monthly-phone-monitoring-TEMPLATE.docx",
  filenamePrefix: "Monthly_Phone_Monitoring",
  yearMarker: "[YEAR]",
};

export const quarterlyDocumentConfig: DocumentTemplateConfig = {
  title: "Quarterly Conference",
  templateUrl: "/template/quarterly-conference-TEMPLATE.docx",
  filenamePrefix: "Quarterly_Conference",
  yearMarker: "[[YEAR]]",
};
