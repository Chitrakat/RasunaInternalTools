import { normalizeStringDate } from "../monthly-phone-monitoring/parser";

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Flattened row text looks like "<Name> [Yes|No] [<Name repeated>] <Completion Date> ..."
const buildRowPattern = (complianceName: string): RegExp => {
  const escapedName = escapeRegExp(complianceName);
  return new RegExp(
    `${escapedName}(?:\\s+(?:Yes|No))?(?:\\s+${escapedName})?\\s+(\\d{1,2}/\\d{1,2}/\\d{2,4})`,
    "g",
  );
};

export const extractComplianceDates = (allPagesText: string[], complianceName: string): string[] => {
  const rowPattern = buildRowPattern(complianceName);
  const isoDates: string[] = [];

  for (const pageText of allPagesText) {
    for (const match of pageText.matchAll(rowPattern)) {
      const isoDate = normalizeStringDate(match[1]);
      if (isoDate) isoDates.push(isoDate);
    }
  }

  return isoDates;
};
