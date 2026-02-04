"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_DETAILS_KEY } from "@/lib/dummyData";
import { SprintGanttSection } from "@/components/sprint/SprintGanttSection";
import { SprintTimelineNav } from "@/components/sprint/SprintTimelineNav";

type SprintDetail = {
  id: string;
  name: string;
  state: string;
  startDate: string;
  endDate: string;
  workspace: { id: string; name: string };
  tasks: Array<{
    id: string;
    summary: string;
    status: string;
    order: number;
    startDate: string | null;
    endDate: string | null;
    blocked?: boolean;
    links?: string | null;
  }>;
  spillovers: Array<{ taskId: string }>;
  health: {
    score: number;
    band: string;
    spilloverCount: number;
    spilloverDays: number;
    completedCount: number;
    totalCount: number;
  };
  prevSprintId: string | null;
  nextSprintId: string | null;
};

function formatState(state: string) {
  if (!state) return state;
  const lower = state.toLowerCase();
  if (lower === "closed") return "Closed";
  if (lower === "active") return "Active";
  return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${e.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function HealthBadge({ band, score }: { band: string; score: number }) {
  const styles =
    band === "healthy"
      ? "bg-[var(--success-bg)] text-[var(--success)]"
      : band === "at_risk"
        ? "bg-[var(--warning-bg)] text-[var(--warning)]"
        : "bg-[var(--danger-bg)] text-[var(--danger)]";
  const label =
    band === "healthy" ? "Healthy" : band === "at_risk" ? "At risk" : "Critical";
  return (
    <span className={`badge ${styles}`}>
      {label} · {score}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="card rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-[var(--text)]">{value}</p>
      {sub != null && (
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{sub}</p>
      )}
    </div>
  );
}

export function SprintDetailClient() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [sprint, setSprint] = useState<SprintDetail | null>(null);

  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DEMO_DETAILS_KEY);
      const details = raw ? (JSON.parse(raw) as Record<string, SprintDetail>) : null;
      setSprint(details?.[id] ?? null);
    } catch {
      setSprint(null);
    }
  }, [id]);

  if (!sprint) {
    return (
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Link href="/sprints?demo=1" className="btn-ghost mb-6 inline-flex text-sm">
            ← Back to Sprints
          </Link>
          <div className="card rounded-xl border-dashed p-10 text-center">
            <p className="text-[var(--text-secondary)]">
              Demo sprint not found. Load demo data from the home page first.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const completedCount = sprint.health?.completedCount ?? 0;
  const totalCount = sprint.health?.totalCount ?? sprint.tasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const otherSprints: Array<{ id: string; name: string }> = [];

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/sprints?demo=1" className="btn-ghost mb-6 inline-flex text-sm">
          ← Back to Sprints
        </Link>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Viewing demo data from browser storage. Read-only.
        </p>

        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                  {sprint.name}
                </h1>
                {sprint.health && (
                  <HealthBadge band={sprint.health.band} score={sprint.health.score} />
                )}
              </div>
              <p className="mt-2 text-[var(--text-secondary)]">
                {sprint.workspace.name} · {formatState(sprint.state)} ·{" "}
                {formatDateRange(sprint.startDate, sprint.endDate)}
              </p>
            </div>
            <SprintTimelineNav
              prevSprintId={sprint.prevSprintId}
              nextSprintId={sprint.nextSprintId}
              sprintEndDate={sprint.endDate}
              workspaceId={sprint.workspace.id}
              isClosed={sprint.state.toLowerCase() === "closed"}
              workspaces={[]}
              demoMode
            />
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Tasks"
            value={totalCount}
            sub={`${completedCount} done (${completionPct}%)`}
          />
          <StatCard
            label="Spillovers"
            value={sprint.health?.spilloverCount ?? 0}
            sub={
              (sprint.health?.spilloverDays ?? 0) > 0
                ? `${sprint.health.spilloverDays} days`
                : undefined
            }
          />
          <StatCard
            label="Health"
            value={sprint.health?.score ?? "—"}
            sub={sprint.health?.band?.replace("_", " ") ?? ""}
          />
          <StatCard label="State" value={formatState(sprint.state)} />
        </section>

        <SprintGanttSection
          sprintId={sprint.id}
          workspaceId={sprint.workspace.id}
          sprintStart={sprint.startDate}
          sprintEnd={sprint.endDate}
          tasks={sprint.tasks}
          spilloverTaskIds={sprint.spillovers?.map((s) => s.taskId) ?? []}
          otherSprints={otherSprints}
          readOnly
        />
      </div>
    </main>
  );
}
