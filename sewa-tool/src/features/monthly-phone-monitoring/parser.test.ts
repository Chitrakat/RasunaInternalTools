import { describe, expect, it } from "vitest";

import {
  detectDuplicateDates,
  detectYearsFromDates,
  groupDatesByYear,
  parseMonitoringInput,
  selectMonitoringDates,
  sortDatesChronologically,
} from "./parser";
import {
  buildPhoneMonitoringEntries,
  buildFilename,
  sanitizeFilename,
  validateDocumentData,
} from "./generator";

const sampleInput = `FHCA Monthly Telephone Monitoring | 7/29/26 | 8/29/26 | 8/10/26
FHCA Monthly Telephone Monitoring | 6/24/26 | 7/24/26 | 6/24/26
FHCA Monthly Telephone Monitoring | 5/28/26 | 6/28/26 | 6/2/26
FHCA Monthly Telephone Monitoring | 4/21/26 | 5/21/26 | 4/21/26
FHCA Monthly Telephone Monitoring | 3/11/26 | 4/11/26 | 4/1/26
FHCA Monthly Telephone Monitoring | 2/25/26 | 3/25/26 | 2/25/26
FHCA Monthly Telephone Monitoring | 12/29/25 | 1/29/26 | 12/29/25
FHCA Monthly Telephone Monitoring | 11/27/25 | 12/27/25 | 12/17/25
FHCA Monthly Telephone Monitoring | 10/24/25 | 11/24/25 | 12/17/25
FHCA Monthly Telephone Monitoring | 9/26/25 | 10/26/25 | 12/17/25
FHCA Monthly Telephone Monitoring | 8/28/25 | 9/28/25 | 12/17/25
FHCA Monthly Telephone Monitoring | 7/28/25 | 8/28/25 | 12/17/25`;

const multilineSampleInput = `FHCA Monthly Telephone Monitoring
7/29/26
8/29/26
8/10/26
FHCA Monthly Telephone Monitoring
6/24/26
7/24/26
6/24/26
FHCA Monthly Telephone Monitoring
5/28/26
6/28/26
6/2/26
FHCA Monthly Telephone Monitoring
4/21/26
5/21/26
4/21/26
FHCA Monthly Telephone Monitoring
3/11/26
4/11/26
4/1/26
FHCA Monthly Telephone Monitoring
2/25/26
3/25/26
2/25/26
FHCA Monthly Telephone Monitoring
12/29/25
1/29/26
12/29/25
FHCA Monthly Telephone Monitoring
11/27/25
12/27/25
12/17/25
FHCA Monthly Telephone Monitoring
10/24/25
11/24/25
12/17/25
FHCA Monthly Telephone Monitoring
9/26/25
10/26/25
12/17/25
FHCA Monthly Telephone Monitoring
8/28/25
9/28/25
12/17/25
FHCA Monthly Telephone Monitoring
7/28/25
8/28/25
12/17/25`;

describe("monitoring parser", () => {
  it("parses the provided monitoring schedule into rows and detects dates", () => {
    const parsed = parseMonitoringInput(sampleInput);

    expect(parsed.rows.length).toBeGreaterThan(0);
    expect(parsed.records.length).toBe(12);
    expect(parsed.records[0].dates).toHaveLength(3);
    expect(parsed.records[0].dates[0]).toBe("2026-07-29");
  });

  it("parses vertically stacked activity and date lines", () => {
    const parsed = parseMonitoringInput(multilineSampleInput);

    expect(parsed.errors).toEqual([]);
    expect(parsed.records).toHaveLength(12);
    expect(parsed.records[0]).toEqual({
      activity: "FHCA Monthly Telephone Monitoring",
      dates: ["2026-07-29", "2026-08-29", "2026-08-10"],
      sourceRow: 1,
    });
  });

  it("selects the configured third date column by default and preserves the input order", () => {
    const parsed = parseMonitoringInput(sampleInput);
    const selected = selectMonitoringDates(parsed.records, 2);

    expect(selected.map((date) => date.toISOString().slice(0, 10))).toEqual([
      "2026-08-10",
      "2026-06-24",
      "2026-06-02",
      "2026-04-21",
      "2026-04-01",
      "2026-02-25",
      "2025-12-29",
      "2025-12-17",
      "2025-12-17",
      "2025-12-17",
      "2025-12-17",
      "2025-12-17",
    ]);

    expect(sortDatesChronologically(selected)).toHaveLength(selected.length);
  });

  it("selects the first date column when no column is provided", () => {
    const parsed = parseMonitoringInput(sampleInput);
    const selected = selectMonitoringDates(parsed.records);

    expect(selected[0]?.toISOString().slice(0, 10)).toBe("2026-07-29");
  });

  it("detects duplicates deterministically", () => {
    const dates = ["2025-07-28", "2025-08-28", "2025-12-17"];
    const duplicates = detectDuplicateDates(dates, ["2025-07-28", "2025-09-26"]);

    expect(duplicates).toEqual(["2025-07-28"]);
  });

  it("detects the calendar years in a selected schedule and groups them by year", () => {
    const selectedDates = [
      new Date("2025-12-17T00:00:00Z"),
      new Date("2025-12-29T00:00:00Z"),
      new Date("2026-01-29T00:00:00Z"),
      new Date("2026-02-25T00:00:00Z"),
    ];

    expect(detectYearsFromDates(selectedDates)).toEqual(["2025", "2026"]);
    expect(groupDatesByYear(selectedDates)).toEqual({
      2025: [new Date("2025-12-17T00:00:00Z"), new Date("2025-12-29T00:00:00Z")],
      2026: [new Date("2026-01-29T00:00:00Z"), new Date("2026-02-25T00:00:00Z")],
    });
  });

  it("creates phone-monitoring entries and default objective values", () => {
    const entries = buildPhoneMonitoringEntries([
      { date: "2025-03-31", typeOfContact: "Phone Call", hcaName: "Christopher Tran" },
      { date: "2025-04-28", typeOfContact: "Phone Call", hcaName: "Christopher Tran" },
    ]);

    expect(entries).toHaveLength(2);
    expect(entries[0].purpose).toBe(
      "I called Christopher for the monthly check-in.\nHCA said everything is going well and will let me know if anything is needed.",
    );
    expect(entries[0].objectiveMet).toBe(true);
    expect(entries[1].objectiveMet).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = validateDocumentData({
      participant: "",
      hca: "Christopher Tran",
      supervisor: "Binay Khadgi",
      year: "2025",
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain("Participant is required.");
  });

  it("sanitizes the generated output filename", () => {
    expect(sanitizeFilename("Rasuna / Monthly Phone Monitoring / Christopher Tran 2025")).toBe(
      "Rasuna_Monthly_Phone_Monitoring_Christopher_Tran_2025",
    );
  });

  it("uses the Quarterly Conference filename prefix", () => {
    expect(buildFilename({
      participant: "HELLO",
      hca: "F N",
      year: "2026",
      prefix: "Quarterly_Conference",
    })).toEqual({
      docx: "Rasuna_Quarterly_Conference_HELLO_F_N_2026.docx",
      pdf: "Rasuna_Quarterly_Conference_HELLO_F_N_2026.pdf",
    });
  });
});
