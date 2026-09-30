import { describe, expect, it } from "vitest";

import { extractComplianceDates } from "./complianceExtractor";

const EXPORT_PAGE_TEXT = `
FHCA Monthly Telephone Monitoring Yes FHCA Monthly Telephone Monitoring 9/28/26 10/28/26 Monthly Call completed on 9/28/26
FHCA Monthly Telephone Monitoring 8/26/26 9/26/26 9/17/26
FHCA Monthly Telephone Monitoring 7/29/26 8/29/26 8/17/26
FHCA Monthly Telephone Monitoring 6/24/26 7/24/26 6/24/26
`;

const EXPORT_PAGE_TWO_TEXT = `
Quarterly Conference Yes Quarterly Conference 9/17/26 12/17/26 A Quarterly conference was conducted on 9/17/26.
Quarterly Conference 6/24/26 9/24/26 6/24/26
Quarterly Conference 3/13/26 6/13/26 3/13/26
`;

describe("extractComplianceDates", () => {
  it("extracts Completion Date for each matching monthly monitoring row, in order", () => {
    const dates = extractComplianceDates([EXPORT_PAGE_TEXT], "FHCA Monthly Telephone Monitoring");
    expect(dates).toEqual(["2026-09-28", "2026-08-26", "2026-07-29", "2026-06-24"]);
  });

  it("extracts Completion Date for each matching quarterly conference row, in order", () => {
    const dates = extractComplianceDates([EXPORT_PAGE_TWO_TEXT], "Quarterly Conference");
    expect(dates).toEqual(["2026-09-17", "2026-06-24", "2026-03-13"]);
  });

  it("returns an empty list when the compliance name is not present", () => {
    expect(extractComplianceDates([EXPORT_PAGE_TEXT], "Quarterly Conference")).toEqual([]);
  });
});
