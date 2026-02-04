import Link from "next/link";
import { SprintsListWithNew } from "@/components/sprint/SprintsListWithNew";

const base = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:5000";

async function getSprints() {
  const res = await fetch(`${base}/api/sprints`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch sprints");
  return res.json() as Promise<
    Array<{
      id: string;
      name: string;
      state: string;
      startDate: string;
      endDate: string;
      _count: { tasks: number };
      workspace: { id: string; name: string };
    }>
  >;
}

async function getWorkspaces() {
  const res = await fetch(`${base}/api/workspaces`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<
    Array<{ id: string; name: string; sprintLengthDays?: number }>
  >;
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${e.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

/** Display state with first letter capital; closed sprints always show "Closed". */
function formatState(state: string) {
  if (!state) return state;
  const lower = state.toLowerCase();
  if (lower === "closed") return "Closed";
  if (lower === "active") return "Active";
  return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
}

export default async function SprintsPage() {
  const [sprints, workspaces] = await Promise.all([
    getSprints(),
    getWorkspaces(),
  ]);

  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
              Sprints
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Select a sprint to view timeline and health.
            </p>
          </div>
          {workspaces.length > 0 && (
            <SprintsListWithNew workspaces={workspaces} />
          )}
        </div>

        {sprints.length === 0 ? (
          <div className="card rounded-xl border-dashed p-10 text-center">
            <p className="text-[var(--text-secondary)]">
              No sprints yet. Seed the database with:
            </p>
            <code className="mt-3 inline-block rounded-lg bg-[var(--bg-muted)] px-3 py-2 text-sm font-medium text-[var(--text)]">
              npm run db:seed
            </code>
          </div>
        ) : (
          <ul className="space-y-3">
            {sprints.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sprints/${s.id}`}
                  className="card card-hover flex flex-col gap-1 p-4 transition sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-semibold text-[var(--text)]">
                      {s.name}
                    </span>
                    <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                      {s.workspace.name} ·{" "}
                      {formatDateRange(s.startDate, s.endDate)}
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
        )}
      </div>
    </main>
  );
}
