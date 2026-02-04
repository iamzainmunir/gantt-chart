import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SprintMind — AI-driven sprint intelligence",
  description:
    "Track, understand, and plan sprints with Gantt timelines and spillover handling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-pt-20">
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
        }}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-elevated)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-elevated)]/80">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
              <a
                href="/"
                className="text-lg font-semibold tracking-tight text-[var(--text)] transition opacity-90 hover:opacity-100"
              >
                SprintMind
              </a>
              <nav className="flex items-center gap-1">
                <a
                  href="/"
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
                >
                  Home
                </a>
                <a
                  href="/sprints"
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
                >
                  Sprints
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
