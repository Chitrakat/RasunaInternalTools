import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SEWA</p>
          <h1>INTERNAL TOOLS</h1>
        </div>
      </header>

      <div className="workspace-shell">
        <aside className="sidebar" aria-label="Tool navigation">
          <p className="nav-label">DOCUMENTS</p>
          <div className="nav-item active">Monthly Phone Monitoring</div>
          <p className="nav-label muted">OPERATIONS</p>
          <div className="nav-item disabled">Future tools</div>
        </aside>

        <main className="main-panel">{children}</main>
      </div>
    </div>
  );
}
