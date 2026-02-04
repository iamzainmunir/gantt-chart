"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Workspace = { id: string; name: string; sprintLengthDays?: number };

type Props = {
  onClose: () => void;
  workspaces: Workspace[];
  suggestedStartDate?: string; // ISO or YYYY-MM-DD, e.g. for "Start next sprint"
  suggestedWorkspaceId?: string;
};

const LENGTH_OPTIONS = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
];

export function NewSprintModal({
  onClose,
  workspaces,
  suggestedStartDate,
  suggestedWorkspaceId,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [workspaceId, setWorkspaceId] = useState(
    suggestedWorkspaceId ?? workspaces[0]?.id ?? ""
  );
  const [sprintLengthDays, setSprintLengthDays] = useState(14);
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWorkspace = workspaces.find((w) => w.id === workspaceId);
  const effectiveLength = selectedWorkspace?.sprintLengthDays ?? sprintLengthDays;

  useEffect(() => {
    if (suggestedWorkspaceId && workspaces.some((w) => w.id === suggestedWorkspaceId)) {
      setWorkspaceId(suggestedWorkspaceId);
    } else if (workspaces.length > 0 && !workspaceId) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, suggestedWorkspaceId, workspaceId]);

  useEffect(() => {
    if (selectedWorkspace?.sprintLengthDays) {
      setSprintLengthDays(selectedWorkspace.sprintLengthDays);
    }
  }, [selectedWorkspace?.id, selectedWorkspace?.sprintLengthDays]);

  useEffect(() => {
    if (suggestedStartDate) {
      const d = new Date(suggestedStartDate);
      setStartDate(d.toISOString().slice(0, 10));
    }
  }, [suggestedStartDate]);

  const handleLengthChange = useCallback(
    async (days: number) => {
      setSprintLengthDays(days);
      if (workspaceId) {
        try {
          await fetch(`/api/workspaces/${workspaceId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sprintLengthDays: days }),
          });
          router.refresh();
        } catch {
          // ignore
        }
      }
    },
    [workspaceId, router]
  );

  const computedEndDate = startDate
    ? (() => {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + effectiveLength);
        return end.toISOString().slice(0, 10);
      })()
    : "";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        setError("Sprint name is required");
        return;
      }
      if (!startDate) {
        setError("Start date is required");
        return;
      }
      setError(null);
      setSaving(true);
      try {
        const res = await fetch("/api/sprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            name: name.trim(),
            startDate: new Date(startDate).toISOString(),
            state: "active",
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create sprint");
        }
        const sprint = await res.json();
        onClose();
        router.refresh();
        router.push(`/sprints/${sprint.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create sprint");
      } finally {
        setSaving(false);
      }
    },
    [workspaceId, name, startDate, onClose, router]
  );

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-xl"
      >
        <h3 className="mb-4 font-semibold text-[var(--text)]">Start new sprint</h3>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Sprint name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 2 – March"
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </label>
        {workspaces.length > 1 && (
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Workspace
            </span>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Sprint length
          </span>
          <select
            value={effectiveLength}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
          >
            {LENGTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
            New sprints in this workspace will use this length. End date is set automatically.
          </p>
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
          />
        </label>
        {startDate && computedEndDate && (
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            End date: <span className="font-medium text-[var(--text-secondary)]">{computedEndDate}</span> (auto from length)
          </p>
        )}
        {!startDate && <div className="mb-4" />}
        {error && (
          <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Creating…" : "Start sprint"}
          </button>
        </div>
      </form>
    </div>
  );
}
