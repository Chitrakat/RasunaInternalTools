"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { DEFAULT_DATE_COLUMN_INDEX } from "@/features/monthly-phone-monitoring/config";
import {
  buildFilename,
  generateDocxFromTemplate,
  generatePdfFromEntries,
  validateDocumentData,
} from "@/features/monthly-phone-monitoring/generator";
import { detectYearsFromDates, groupDatesByYear, parseMonitoringInput, selectMonitoringDates } from "@/features/monthly-phone-monitoring/parser";
import { PURPOSE_TEMPLATES } from "@/features/monthly-phone-monitoring/config";
import type { DocumentData, PhoneMonitoringEntry } from "@/features/monthly-phone-monitoring/types";

export default function Page() {
  const [rawInput, setRawInput] = useState("");
  const [documentData, setDocumentData] = useState<DocumentData>({
    participant: "",
    hca: "",
    supervisor: "",
    year: "",
  });
  const [dateColumnIndex, setDateColumnIndex] = useState(DEFAULT_DATE_COLUMN_INDEX);
  const [isGenerating, setIsGenerating] = useState(false);

  const parsed = useMemo(() => parseMonitoringInput(rawInput), [rawInput]);
  const previewDates = useMemo(() => {
    if (!parsed.records.length) return [] as Date[];
    return selectMonitoringDates(parsed.records, dateColumnIndex);
  }, [parsed.records, dateColumnIndex]);

  const yearGroups = useMemo(() => {
    if (!previewDates.length) return {} as Record<number, Date[]>;
    return groupDatesByYear(previewDates);
  }, [previewDates]);

  const detectedYears = useMemo(() => detectYearsFromDates(previewDates), [previewDates]);

  useEffect(() => {
    if (!previewDates.length) {
      return;
    }

    const nextYear = detectedYears[0] ?? documentData.year;
    if (!nextYear) {
      return;
    }

    setDocumentData((prev) => {
      if (prev.year === nextYear) {
        return prev;
      }

      return { ...prev, year: nextYear };
    });
  }, [detectedYears, documentData.year, previewDates.length]);

  const yearOrders = useMemo(() => {
    const years = detectedYears.length ? detectedYears : documentData.year ? [documentData.year] : [];
    return years.filter(Boolean);
  }, [detectedYears, documentData.year]);

  const validation = useMemo(() => validateDocumentData(documentData), [documentData]);

  const yearBundles = useMemo(
    () =>
      yearOrders.map((year) => ({
        year,
        dates: (yearGroups[Number(year)] ?? []).sort((a, b) => a.getTime() - b.getTime()),
        files: buildFilename({
          participant: documentData.participant,
          hca: documentData.hca,
          year,
        }),
      })),
    [documentData.hca, documentData.participant, yearGroups, yearOrders],
  );

  const generateEntries = (year: string): PhoneMonitoringEntry[] =>
    (yearGroups[Number(year)] ?? []).map((labelDate, index) => ({
      date: labelDate.toISOString().slice(0, 10),
      typeOfContact: "Phone Call",
      purpose: index === 0
        ? PURPOSE_TEMPLATES.firstRow(documentData.hca || "the HCA")
        : PURPOSE_TEMPLATES.subsequentRow(documentData.hca || "the HCA"),
      objectiveMet: true,
      hcaName: documentData.hca || "HCA",
    }));

  const updateField = (field: keyof DocumentData, value: string) => {
    setDocumentData((prev) => ({ ...prev, [field]: value }));
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async (format: "docx" | "pdf") => {
    if (!validation.success || previewDates.length === 0 || !yearBundles.length) {
      return;
    }

    setIsGenerating(true);

    try {
      for (const bundle of yearBundles) {
        const entries = generateEntries(bundle.year);
        const outputData: DocumentData = {
          ...documentData,
          year: bundle.year,
        };

        if (format === "docx") {
          const blob = await generateDocxFromTemplate({
            documentData: outputData,
            entries,
          });
          downloadBlob(blob, bundle.files.docx);
        } else {
          const blob = generatePdfFromEntries({
            documentData: outputData,
            entries,
          });
          downloadBlob(blob, bundle.files.pdf);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="hero-block">
        <p className="tag">Monthly Phone Monitoring</p>
        <h2>Generate monthly phone monitoring documents from a monitoring schedule.</h2>
      </div>

      <div className="workflow-grid">
        <section className="panel main-panel-card">
          <div className="section-header">
            <div>
              <p className="section-number">01</p>
              <h3>ENTER MONITORING DATA</h3>
            </div>
          </div>

          <Textarea
            label="Monitoring Schedule"
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            rows={12}
            aria-label="Monitoring schedule input"
          />

          {parsed.errors.length > 0 ? (
            <div className="status-box error-box" role="alert">
              <strong>Parsing issue:</strong>
              <ul>
                {parsed.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="section-header small-gap">
            <div>
              <p className="section-number">02</p>
              <h3>DOCUMENT INFORMATION</h3>
            </div>
          </div>

          <div className="two-column-grid">
            <Input label="Participant" value={documentData.participant} onChange={(event) => updateField("participant", event.target.value)} />
            <Input label="HCA" value={documentData.hca} onChange={(event) => updateField("hca", event.target.value)} />
            <Input label="Supervisor" value={documentData.supervisor} onChange={(event) => updateField("supervisor", event.target.value)} />
            <Input label="Year" value={documentData.year} onChange={(event) => updateField("year", event.target.value)} />
          </div>

          <div className="section-header small-gap">
            <div>
              <p className="section-number">03</p>
              <h3>DATE TO USE FOR PHONE CALL LOG</h3>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="date-column">Select date column</label>
            <select
              id="date-column"
              className="select"
              value={dateColumnIndex}
              onChange={(event) => setDateColumnIndex(Number(event.target.value))}
            >
              <option value={0}>First date column</option>
              <option value={1}>Second date column</option>
              <option value={2}>Third date column</option>
            </select>
          </div>

          {previewDates.length > 0 ? (
            <div className="preview-stack">
              <h4>PHONE CALL LOG DATES</h4>
              <ul className="date-list">
                {previewDates.map((date) => (
                  <li key={`${date.toISOString()}-${date.getTime()}`}>{date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {!validation.success ? (
            <div className="status-box error-box" role="alert">
              <strong>Missing required fields:</strong>
              <ul>
                {validation.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <aside className="panel side-panel-card">
          <div className="section-header">
            <div>
              <p className="section-number">04</p>
              <h3>PREVIEW</h3>
            </div>
          </div>

          <div className="summary-box">
            <p>Participant</p>
            <strong>{documentData.participant || "—"}</strong>
            <p>HCA</p>
            <strong>{documentData.hca || "—"}</strong>
            <p>Supervisor</p>
            <strong>{documentData.supervisor || "—"}</strong>
            <p>DATES TO ADD</p>
            <strong>{previewDates.length}</strong>
            <p>Year(s)</p>
            <strong>{yearOrders.length ? yearOrders.join(", ") : "—"}</strong>
            <p>File names</p>
            {yearBundles.length ? (
              yearBundles.map((bundle) => (
                <strong key={`${bundle.year}-files`} className="mono">
                  {bundle.files.docx}
                  <br />
                  {bundle.files.pdf}
                </strong>
              ))
            ) : (
              <strong className="mono">No files ready yet</strong>
            )}
          </div>

          <div className="action-stack">
            <Button variant="primary" disabled={!validation.success || previewDates.length === 0 || isGenerating} onClick={() => void handleGenerate("docx")}>
              {isGenerating ? "Generating..." : "Generate DOCX"}
            </Button>
            <Button variant="secondary" disabled={!validation.success || previewDates.length === 0 || isGenerating} onClick={() => void handleGenerate("pdf")}>
              Generate PDF
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
