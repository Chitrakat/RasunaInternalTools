import { describe, expect, it } from "vitest";

import { classifyPdfText } from "./classifier";

// Condensed real text extracted from sample Verveware PDFs (page 1).
const EXPORT_PAGE_ONE_TEXT = `
Annual Background Check (HHS OIG & HFS OIG) Yes Annual Background Check (HHS OIG & HFS OIG) 10/30/25 10/30/26
FHCA Monthly Telephone Monitoring Yes FHCA Monthly Telephone Monitoring 9/28/26 10/28/26 Monthly Call completed on 9/28/26
Compliance Name Completion Date Renewal Date Updated At
Name Description Completion Date Renewal Date Comment Actions
`;

const WEBDOWNLOAD_PAGE_ONE_TEXT = `
Caregivers / 49
Shazia Abid (49) DOH: 12/31/2025 | Phone: (773) 308-3039
ACTIVE (12/31/25) CAREGIVER MAIN
Profile Schedules Compliance Documents
Team Members
Binay Khadgi (3) SUPERVISOR UNASSIGNED
Agha Abid (900023) FHCA INH2512047
Historian
`;

describe("classifyPdfText", () => {
  it("classifies the compliance export page as 'export'", () => {
    expect(classifyPdfText(EXPORT_PAGE_ONE_TEXT)).toBe("export");
  });

  it("classifies the profile web-download page as 'profile'", () => {
    expect(classifyPdfText(WEBDOWNLOAD_PAGE_ONE_TEXT)).toBe("profile");
  });

  it("returns 'unknown' for unrelated text", () => {
    expect(classifyPdfText("Just some unrelated document text.")).toBe("unknown");
  });
});
