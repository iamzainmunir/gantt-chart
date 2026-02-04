"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEMO_SPRINTS_KEY, type DummySprintListItem } from "@/lib/dummyData";

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${e.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function formatState(state: string) {
  if (!state) return state;
  const lower = state.toLowerCase();
  if (lower === "closed") return "Closed";
  if (lower === "active") return "Active";
  return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
}

export function SprintsPageClient() {
  const [sprints, setSprints] = useState<DummySprintListItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DEMO_SPRINTS_KEY);
      setSprints(raw ? (JSON.parse(raw) as DummySprintListItem[]) : []);
    } catch {
      setSprints([]);
    }
  }, []);

  if (sprints.length === 0) {
    return (
      <div className="card rounded-xl border-dashed p-10 text-center">
        <p className="text-[var(--text-secondary)]">No demo data in browser.</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Use the home page &quot;Use demo data (works offline)&quot; to load demo data first.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            Viewing demo data from browser storage. Sprints are read-only.
          </p>
          <Link href="/" className="btn-ghost text-sm">
            ← Home
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
            Sprints
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Select a sprint to view timeline (demo data).
          </p>
        </div>
        <ul className="space-y-3">
          {(sprints as DummySprintListItem[]).map((s) => (
            <li key={s.id}>
              <Link
                href={`/sprints/${s.id}?demo=1`}
                className="card card-hover flex flex-col gap-1 p-4 transition sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-semibold text-[var(--text)]">{s.name}</span>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                    {s.workspace.name} · {formatDateRange(s.startDate, s.endDate)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-full bg-[var(--bg-muted)] px-2.5 py-0.5 font-medium text-[var(--text-secondary)]">
                    {s._count.tasks} tasks
                  </span>
                  <span
                    className={`badge ${
                      s.state.toLowerCase() === "active"
                        ? "bg-[var(--success-bg)] text-[var(--success)]"
                        : "bg-[var(--bg-muted)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {formatState(s.state)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
