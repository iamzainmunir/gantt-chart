import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--accent)]">
          Sprint planning
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Know what will fail — and what to do next
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--text-secondary)]">
          SimpliEd Sprint Planner turns sprint chaos into predictable execution with Gantt
          timelines, spillover detection, and AI-assisted planning.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/sprints" className="btn-primary">
            View Sprints
            <span aria-hidden>→</span>
          </Link>
          <Link href="/sprints" className="btn-ghost">
            Open dashboard
          </Link>
        </div>
        <ul className="mt-16 grid gap-4 text-sm sm:grid-cols-3">
          <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <span className="text-xl" aria-hidden>
              📊
            </span>
            <div>
              <strong className="text-[var(--text)]">Gantt timeline</strong>
              <p className="mt-1 text-[var(--text-secondary)]">
                Drag to reschedule and resize tasks.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <span className="text-xl" aria-hidden>
              🔴
            </span>
            <div>
              <strong className="text-[var(--text)]">Spillover & health</strong>
              <p className="mt-1 text-[var(--text-secondary)]">
                Auto-detect spillovers and sprint health score.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
            <span className="text-xl" aria-hidden>
              🤖
            </span>
            <div>
              <strong className="text-[var(--text)]">AI (Ollama)</strong>
              <p className="mt-1 text-[var(--text-secondary)]">
                Analyze sprint and classify spillovers locally.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
