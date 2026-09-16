export type MonitoringRecord = {
  activity: string;
  dates: string[];
  sourceRow: number;
};

export type ParsedMonitoringTable = {
  rows: string[];
  records: MonitoringRecord[];
  errors: string[];
};

export type DocumentData = {
  participant: string;
  hca: string;
  supervisor: string;
  year: string;
};

export type PhoneMonitoringEntry = {
  date: string;
  typeOfContact: string;
  purpose: string;
  objectiveMet: boolean;
  hcaName: string;
};

export type PendingDateSelection = {
  selectedColumnIndex: number;
  dates: Date[];
  duplicates: string[];
  existingDocumentDates: string[];
};

export type ValidationResult = {
  success: boolean;
  errors: string[];
};

export type GenerateDocxOptions = {
  documentData: DocumentData;
  entries: PhoneMonitoringEntry[];
  templateUrl?: string;
  templateBuffer?: ArrayBuffer;
  yearMarker?: string;
};

export type DocumentTemplateConfig = {
  title: string;
  templateUrl: string;
  filenamePrefix: string;
  yearMarker: string;
};
