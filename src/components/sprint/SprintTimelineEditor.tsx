"use client";

import { useState } from "react";

type Props = {
  sprintId: string;
  startDate: string;
  endDate: string;
  onSaved?: () => void;
};

export function SprintTimelineEditor({
  sprintId,
  startDate,
  endDate,
  onSaved,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(
    startDate.slice(0, 10) /* YYYY-MM-DD */
  );
  const [end, setEnd] = useState(endDate.slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: new Date(start).toISOString(),
          endDate: new Date(end).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update timeline");
      }
      setEditing(false);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const displayRange = `${new Date(startDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${new Date(endDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--text-secondary)]">
          Timeline: {displayRange}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-ghost text-xs"
        >
          Set timeline
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-muted)]/50 p-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">Start</span>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm text-[var(--text)]"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-secondary)]">End</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm text-[var(--text)]"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setStart(startDate.slice(0, 10));
            setEnd(endDate.slice(0, 10));
            setError(null);
          }}
          className="btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="w-full text-sm text-[var(--danger)]">{error}</p>
      )}
    </div>
  );
}
