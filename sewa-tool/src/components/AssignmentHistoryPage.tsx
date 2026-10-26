"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Status = "Active" | "Ended" | "Cancelled";

type Assignment = {
  id: string;
  hcaId: string;
  clientId: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: Status;
  recordedBy: string;
  notes: string;
};

const demoRows: Assignment[] = [
  { id: "ASG-DEMO-001", hcaId: "EMP-DEMO-01", clientId: "CL-DEMO-01", assignedDate: "2026-01-05", startDate: "2026-01-08", endDate: "2026-03-20", status: "Ended", recordedBy: "Demo Staff", notes: "Client moved to facility care." },
  { id: "ASG-DEMO-002", hcaId: "EMP-DEMO-02", clientId: "CL-DEMO-02", assignedDate: "2026-04-01", startDate: "2026-04-03", endDate: "", status: "Active", recordedBy: "Demo Staff", notes: "Weekday mornings." },
];

const statuses: Status[] = ["Active", "Ended", "Cancelled"];
const empty = { hcaId: "", clientId: "", assignedDate: "", startDate: "", endDate: "", status: "Active" as Status, recordedBy: "", notes: "" };

export function AssignmentHistoryPage() {
  const [rows, setRows] = useState<Assignment[]>(demoRows);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState<"All" | Status>("All");

  const visible = filter === "All" ? rows : rows.filter((r) => r.status === filter);
  const set = (key: keyof typeof empty, value: string) => setForm((f) => ({ ...f, [key]: value }));

  function add() {
    if (!form.hcaId.trim() || !form.clientId.trim()) return;
    const id = `ASG-DEMO-${String(rows.length + 1).padStart(3, "0")}`;
    setRows([...rows, { id, ...form }]);
    setForm(empty);
  }

  function setRowStatus(id: string, status: Status) {
    setRows(rows.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <AppShell>
      <section className="panel">
        <p className="section-number">Prototype</p>
        <div className="section-header">
          <h3>Assignment History</h3>
        </div>
        <p>
          Demo only: fictional data, kept in memory and reset on reload. Mirrors the ASSIGNMENT HISTORY tab in the prototype workbook.
          Assignment records are separate from DAILY FOLLOW-UP notes.
        </p>
      </section>

      <section className="panel" style={{ marginTop: "1.5rem" }}>
        <div className="section-header">
          <h3>New assignment</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          <label>HCA ID / Folder #<input className="input" value={form.hcaId} onChange={(e) => set("hcaId", e.target.value)} /></label>
          <label>Client ID<input className="input" value={form.clientId} onChange={(e) => set("clientId", e.target.value)} /></label>
          <label>Assigned date<input className="input" type="date" value={form.assignedDate} onChange={(e) => set("assignedDate", e.target.value)} /></label>
          <label>Start date<input className="input" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></label>
          <label>End date<input className="input" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></label>
          <label>Status
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Recorded by<input className="input" value={form.recordedBy} onChange={(e) => set("recordedBy", e.target.value)} /></label>
          <label>Notes<input className="input" value={form.notes} onChange={(e) => set("notes", e.target.value)} /></label>
        </div>
        <p style={{ marginTop: "1rem" }}>
          <button type="button" className="button" onClick={add} disabled={!form.hcaId.trim() || !form.clientId.trim()}>Add assignment</button>
        </p>
      </section>

      <section className="panel" style={{ marginTop: "1.5rem" }}>
        <div className="section-header">
          <h3>History ({visible.length})</h3>
          <label>Filter{" "}
            <select value={filter} onChange={(e) => setFilter(e.target.value as "All" | Status)}>
              <option>All</option>
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Assignment ID", "HCA ID", "Client ID", "Assigned", "Start", "End", "Status", "Recorded by", "Notes"].map((h) => (
                  <th key={h} style={{ border: "1px solid #000", padding: "0.4rem", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  {[r.id, r.hcaId, r.clientId, r.assignedDate, r.startDate, r.endDate].map((v, i) => (
                    <td key={i} style={{ border: "1px solid #000", padding: "0.4rem" }}>{v}</td>
                  ))}
                  <td style={{ border: "1px solid #000", padding: "0.4rem" }}>
                    <select value={r.status} onChange={(e) => setRowStatus(r.id, e.target.value as Status)}>
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ border: "1px solid #000", padding: "0.4rem" }}>{r.recordedBy}</td>
                  <td style={{ border: "1px solid #000", padding: "0.4rem" }}>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
