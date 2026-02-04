"use client";

import { useState } from "react";

const STATUS_OPTIONS = ["To Do", "In Progress", "In Review", "Done", "Blocked"];

type Props = {
  sprintId: string;
  sprintStart: string;
  sprintEnd: string;
  onClose: () => void;
  onAdded: () => void;
};

export function AddTaskModal({
  sprintId,
  sprintStart,
  sprintEnd,
  onClose,
  onAdded,
}: Props) {
  const defaultStart = sprintStart.slice(0, 10);
  const defaultEnd = sprintEnd.slice(0, 10);

  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("To Do");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [links, setLinks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprintId,
          summary: summary.trim(),
          status,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          links: links.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create task");
      }
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-xl"
      >
        <h3 className="mb-4 font-semibold text-[var(--text)]">Add task</h3>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Summary
          </span>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Implement user settings page"
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            End date
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Links, screenshots (optional)
          </span>
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="One URL per line (e.g. ticket, screenshot, Figma)"
            rows={3}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Adding…" : "Add task"}
          </button>
        </div>
      </form>
    </div>
  );
}
