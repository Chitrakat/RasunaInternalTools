import JSZip from "jszip";
import { jsPDF } from "jspdf";

import { PHONE_CALL_LOG_TYPE, PURPOSE_TEMPLATES } from "./config";
import type { DocumentData, GenerateDocxOptions, PhoneMonitoringEntry, ValidationResult } from "./types";

const WORD_XML_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const DEFAULT_TEMPLATE_PATH = "/template/monthly-phone-monitoring-TEMPLATE.docx";

export const validateDocumentData = (data: DocumentData): ValidationResult => {
  const errors: string[] = [];

  if (!data.participant?.trim()) {
    errors.push("Participant is required.");
  }

  if (!data.hca?.trim()) {
    errors.push("HCA is required.");
  }

  if (!data.supervisor?.trim()) {
    errors.push("Supervisor is required.");
  }

  if (!data.year?.trim()) {
    errors.push("Year is required.");
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

export const sanitizeFilename = (input: string): string => {
  const sanitized = input
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+/g, "_");

  return sanitized || "rasuna_document";
};

export const buildFilename = (data: { participant: string; hca: string; year: string; prefix?: string }): { docx: string; pdf: string } => {
  const hcaPart = data.hca.trim().replace(/\s+/g, "_");
  const participantPart = data.participant.trim().replace(/\s+/g, "_");
  const yearPart = data.year?.trim() || "unknown";

  const prefix = data.prefix?.trim() || "Monthly_Phone_Monitoring";
  const docxName = sanitizeFilename(`Rasuna_${prefix}_${participantPart}_${hcaPart}_${yearPart}.docx`);
  const pdfName = sanitizeFilename(`Rasuna_${prefix}_${participantPart}_${hcaPart}_${yearPart}.pdf`);

  return { docx: docxName, pdf: pdfName };
};

export const buildPhoneMonitoringEntryContent = (date: string, hcaName: string) => ({
  date,
  typeOfContact: PHONE_CALL_LOG_TYPE,
  purpose: PURPOSE_TEMPLATES.firstRow(hcaName),
  objectiveMet: true,
});

export const buildPhoneMonitoringEntries = (
  input: Array<{ date: string; typeOfContact: string; hcaName: string }>,
): Array<{
  date: string;
  typeOfContact: string;
  purpose: string;
  objectiveMet: boolean;
  hcaName: string;
}> =>
  input.map((entry, index) => {
    const purpose =
      index === 0
        ? PURPOSE_TEMPLATES.firstRow(entry.hcaName)
        : PURPOSE_TEMPLATES.subsequentRow(entry.hcaName);

    return {
      date: entry.date,
      typeOfContact: entry.typeOfContact,
      purpose,
      objectiveMet: true,
      hcaName: entry.hcaName,
    };
  });

const replaceStringInXml = (xmlDocument: Document, search: string, replace: string) => {
  const textNodes = Array.from(xmlDocument.getElementsByTagNameNS(WORD_XML_NS, "t"));

  textNodes.forEach((node) => {
    if (node.textContent && node.textContent.includes(search)) {
      node.textContent = node.textContent.replaceAll(search, replace);
    }
  });
};

const setCellText = (xmlDocument: Document, cell: Element, value: string) => {
  const paragraphs = Array.from(cell.getElementsByTagNameNS(WORD_XML_NS, "p"));
  let paragraph = paragraphs[0];

  if (!paragraph) {
    paragraph = xmlDocument.createElementNS(WORD_XML_NS, "w:p");
    cell.appendChild(paragraph);
  }

  // Drop any extra paragraphs (e.g. leftover "Y or N?" label text) so only the new value remains.
  paragraphs.slice(1).forEach((extraParagraph) => extraParagraph.parentNode?.removeChild(extraParagraph));

  while (paragraph.firstChild) {
    paragraph.removeChild(paragraph.firstChild);
  }

  const run = xmlDocument.createElementNS(WORD_XML_NS, "w:r");
  const text = xmlDocument.createElementNS(WORD_XML_NS, "w:t");
  text.setAttribute("xml:space", "preserve");
  text.textContent = value;
  run.appendChild(text);
  paragraph.appendChild(run);
};

const insertRowsIntoTable = (xmlDocument: Document, entries: PhoneMonitoringEntry[]) => {
  const tables = Array.from(xmlDocument.getElementsByTagNameNS(WORD_XML_NS, "tbl"));
  const targetTable = tables.find((table) => {
    const text = table.textContent || "";
    return text.includes("Date") || text.includes("Type") || text.includes("Objective");
  });

  if (!targetTable) {
    return;
  }

  const rowCandidates = Array.from(targetTable.getElementsByTagNameNS(WORD_XML_NS, "tr"));
  const templateRow = rowCandidates.find((row) => row.textContent?.includes("Date")) ?? rowCandidates[0];

  if (!templateRow) {
    return;
  }

  // Keep the template row's original header text (e.g. "Objective Met? / Y or N?") untouched.
  const preservedRows = rowCandidates.filter((row) => row !== templateRow);
  preservedRows.forEach((node) => node.parentNode?.removeChild(node));

  entries.forEach((entry) => {
    const clonedRow = templateRow.cloneNode(true) as Element;
    const cells = Array.from(clonedRow.getElementsByTagNameNS(WORD_XML_NS, "tc"));
    const values = [
      new Date(entry.date).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric", timeZone: "UTC" }),
      entry.typeOfContact,
      entry.purpose.replace(/\n/g, " "),
      entry.objectiveMet ? "Y" : "N",
    ];

    cells.forEach((cell, index) => {
      setCellText(xmlDocument, cell, values[index] ?? "");
    });

    targetTable.appendChild(clonedRow);
  });
};

export async function generateDocxFromTemplate({
  documentData,
  entries,
  templateUrl = DEFAULT_TEMPLATE_PATH,
  yearMarker = "[YEAR]",
}: GenerateDocxOptions): Promise<Blob> {
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Unable to load the DOCX template: ${response.status}`);
  }

  const templateBytes = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(templateBytes);
  const documentXmlFile = zip.file("word/document.xml");

  if (!documentXmlFile) {
    throw new Error("The DOCX template is missing the main document.xml file.");
  }

  const documentXml = await documentXmlFile.async("string");
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(documentXml, "application/xml");

  const replacements: Record<string, string> = {
    "Participant:": `Participant: ${documentData.participant}`,
    "HCA:": `HCA: ${documentData.hca}`,
    "Supervisor:": `Supervisor: ${documentData.supervisor}`,
    [yearMarker]: documentData.year,
  };

  Object.entries(replacements).forEach(([search, value]) => {
    replaceStringInXml(xmlDocument, search, value);
  });
  insertRowsIntoTable(xmlDocument, entries);

  zip.file("word/document.xml", new XMLSerializer().serializeToString(xmlDocument));

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export const generatePdfFromEntries = ({
  documentData,
  entries,
  title = "Monthly Phone Monitoring",
}: {
  documentData: DocumentData;
  entries: PhoneMonitoringEntry[];
  title?: string;
}): Blob => {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  let y = 56;

  pdf.setFontSize(18);
  pdf.text(title, 52, y);
  y += 26;

  pdf.setFontSize(11);
  pdf.text(`Participant: ${documentData.participant || "—"}`, 52, y);
  y += 18;
  pdf.text(`HCA: ${documentData.hca || "—"}`, 52, y);
  y += 18;
  pdf.text(`Supervisor: ${documentData.supervisor || "—"}`, 52, y);
  y += 18;
  pdf.text(`Year: ${documentData.year || "—"}`, 52, y);
  y += 24;

  pdf.setFontSize(10);
  pdf.text("Date", 52, y);
  pdf.text("Type", 146, y);
  pdf.text("Purpose", 220, y);
  pdf.text("Objective", 470, y);
  y += 12;

  entries.forEach((entry) => {
    const lines = pdf.splitTextToSize(entry.purpose, 190);

    pdf.text(new Date(entry.date).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric", timeZone: "UTC" }), 52, y);
    pdf.text(entry.typeOfContact, 146, y);
    pdf.text(lines[0] ?? "", 220, y);
    pdf.text(entry.objectiveMet ? "Y" : "N", 470, y);

    y += Math.max(16, lines.length * 12);

    if (y > 720) {
      pdf.addPage();
      y = 52;
    }
  });

  return pdf.output("blob");
};
