"use client";

import { useState } from "react";

type Insight = {
  id: string;
  summary: string;
  spilloverClassifications: Array<{ taskSummary: string; reason: string }>;
  provider: string;
  model: string | null;
  createdAt: string;
};

export function AIInsightsPanel({ sprintId }: { sprintId: string }) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sprints/${sprintId}/insights`);
      const data = (await res.json()) as { insight: Insight | null };
      setInsight(data.insight);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`/api/sprints/${sprintId}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
        return;
      }
      setInsight({
        id: "",
        summary: data.summary,
        spilloverClassifications: data.spilloverClassifications ?? [],
        provider: "ollama",
        model: null,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="card rounded-xl p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-heading mb-0">AI Insights (Ollama)</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadInsights}
            disabled={loading}
            className="btn-ghost text-sm"
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={analyzing}
            className="btn-primary text-sm"
          >
            {analyzing ? "Analyzing…" : "Analyze sprint"}
          </button>
        </div>
      </div>
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        Run Ollama locally (e.g.{" "}
        <code className="rounded bg-[var(--bg-muted)] px-1">
          ollama run llama3.2
        </code>
        ), then click &quot;Analyze sprint&quot; for a retrospective and
        spillover reasons.
      </p>
      {error && (
        <div className="mb-4 rounded-lg border border-[var(--danger)]/50 bg-[var(--danger-bg)]/50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}
      {insight ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-[var(--accent-muted)]/50 p-4">
            <p className="text-sm font-medium text-[var(--text)]">
              {insight.summary}
            </p>
            {insight.createdAt && (
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {new Date(insight.createdAt).toLocaleString()} ·
                {insight.provider === "ollama" && " Ollama"}
                {insight.model && ` · ${insight.model}`}
              </p>
            )}
          </div>
          {insight.spilloverClassifications &&
            insight.spilloverClassifications.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Spillover reasons
                </h3>
                <ul className="space-y-2">
                  {insight.spilloverClassifications.map((c, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-[var(--text)]">
                        {c.taskSummary}
                      </span>
                      <span className="text-[var(--text-secondary)]">→</span>
                      <span className="text-[var(--text-secondary)]">
                        {c.reason}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-sm text-[var(--text-muted)]">
            No insights yet. Click &quot;Analyze sprint&quot; to generate with
            Ollama.
          </p>
        )
      )}
    </div>
  );
}
