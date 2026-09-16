import { DEFAULT_DATE_COLUMN_INDEX } from "./config";
import type { MonitoringRecord, ParsedMonitoringTable, PhoneMonitoringEntry } from "./types";

const normalizeDateString = (value: string): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/);
  if (!match) return null;

  const parts = trimmed.replace(/\//g, "-").replace(/\./g, "-").split("-");
  const hasYearFirst = parts[0].length === 4 || Number(parts[0]) > 31;

  let year: number;
  let month: number;
  let day: number;

  if (hasYearFirst) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else {
    month = Number(parts[0]);
    day = Number(parts[1]);
    year = Number(parts[2]);
  }

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const sanitizeCells = (value: string): string => value.replace(/\r/g, "").trim();

export const parseMonitoringInput = (rawInput: string): ParsedMonitoringTable => {
  if (!rawInput || !rawInput.trim()) {
    return { rows: [], records: [], errors: ["No input data was provided."] };
  }

  const lines = rawInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: string[] = [];
  const records: MonitoringRecord[] = [];
  const errors: string[] = [];

  const addRecord = (activity: string, dateValues: string[], sourceRow: number): void => {
    const dates = dateValues.map((cell) => normalizeDateString(cell)).filter(Boolean) as string[];

    rows.push([activity, ...dateValues].join(" | "));

    if (!activity) {
      errors.push(`Row ${sourceRow}: Missing activity value.`);
    }

    if (dates.length === 0) {
      errors.push(`Row ${sourceRow}: No valid dates were found.`);
    }

    records.push({
      activity,
      dates,
      sourceRow,
    });
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const tableLike = line.includes("|")
      ? line.split("|")
      : line.split(/\t+/);

    const cells = tableLike.map(sanitizeCells).filter((cell) => cell !== "");
    if (cells.length === 0) {
      continue;
    }

    if (cells.length === 1 && !normalizeDateString(cells[0])) {
      const dates: string[] = [];
      let nextIndex = index + 1;

      while (nextIndex < lines.length && normalizeDateString(lines[nextIndex])) {
        dates.push(lines[nextIndex]);
        nextIndex += 1;
      }

      if (dates.length > 0) {
        addRecord(cells[0], dates, index + 1);
        index = nextIndex - 1;
        continue;
      }
    }

    const activity = cells[0] || "";
    addRecord(activity, cells.slice(1), index + 1);
  }

  return { rows, records, errors };
};

export const selectMonitoringDates = (records: MonitoringRecord[], columnIndex: number = DEFAULT_DATE_COLUMN_INDEX): Date[] => {
  // Keep the same order the records were entered in rather than re-sorting chronologically.
  return records
    .map((record) => {
      const value = record.dates[columnIndex] ?? null;
      if (!value) return null;
      const date = new Date(`${value}T00:00:00Z`);
      return Number.isNaN(date.getTime()) ? null : date;
    })
    .filter((date): date is Date => date !== null);
};

export const detectYearsFromDates = (dates: Date[]): string[] => {
  const years = new Set<number>();

  dates.forEach((date) => {
    if (date && Number.isFinite(date.getTime())) {
      years.add(date.getUTCFullYear());
    }
  });

  return Array.from(years).sort((a, b) => a - b).map(String);
};

export const groupDatesByYear = (dates: Date[]): Record<number, Date[]> => {
  const groups: Record<number, Date[]> = {};

  dates.forEach((date) => {
    const year = date.getUTCFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(date);
  });

  return Object.fromEntries(
    Object.entries(groups)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([year, yearDates]) => [Number(year), [...yearDates]]),
  ) as Record<number, Date[]>;
};

export const sortDatesChronologically = (dates: Date[]): Date[] =>
  [...dates].sort((a, b) => a.getTime() - b.getTime());

export const detectDuplicateDates = (existingDates: string[], candidateDates: string[]): string[] => {
  const existingSet = new Set(existingDates.map((date) => date.trim()));
  return candidateDates.filter((date) => existingSet.has(date.trim()));
};

export const buildPhoneMonitoringEntries = (
  input: Array<{ date: string; typeOfContact: string; hcaName: string }>,
): PhoneMonitoringEntry[] => {
  return input.map((entry, index) => {
    const purpose =
      index === 0
        ? `I called ${entry.hcaName} for the monthly check-in.\nHCA said everything is going well and will let me know if anything is needed.`
        : `I completed the monthly check-in call with ${entry.hcaName}.\nThe HCA reported all is going well and will reach out if support is needed.`;

    return {
      date: entry.date,
      typeOfContact: entry.typeOfContact,
      purpose,
      objectiveMet: true,
      hcaName: entry.hcaName,
    };
  });
};

export const normalizeStringDate = (value: string): string | null => normalizeDateString(value);
