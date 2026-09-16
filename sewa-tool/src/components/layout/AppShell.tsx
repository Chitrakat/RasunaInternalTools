"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
          <Link className={`nav-item ${pathname === "/" ? "active" : ""}`} href="/">Monthly Phone Monitoring</Link>
          <Link className={`nav-item ${pathname === "/quarterly-conference" ? "active" : ""}`} href="/quarterly-conference">Quarterly Conference</Link>
          <p className="nav-label muted">OPERATIONS</p>
          <div className="nav-item disabled">Future tools</div>
        </aside>

        <main className="main-panel">{children}</main>
      </div>
    </div>
  );
}
