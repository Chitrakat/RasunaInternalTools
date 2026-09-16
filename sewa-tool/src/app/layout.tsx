import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEWA Internal Tools",
  description: "Monthly Phone Monitoring document generator for SEWA Senior Care.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
