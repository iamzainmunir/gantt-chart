"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { GanttTask } from "@/components/gantt/GanttChart";

const STATUS_OPTIONS = ["To Do", "In Progress", "In Review", "Done", "Blocked"];

type OtherSprint = { id: string; name: string };

type Props = {
  task: GanttTask;
  sprintId: string;
  otherSprints: OtherSprint[];
  onRefresh: () => void;
};

export function TaskPanelActions({
  task,
  sprintId,
  otherSprints,
  onRefresh,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => {
    onRefresh();
    router.refresh();
  }, [onRefresh, router]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) refresh();
      } catch {
        // ignore
      }
    },
    [task.id, refresh]
  );

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.summary}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) refresh();
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const handleMove = async (targetSprintId: string) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintId: targetSprintId }),
      });
      if (res.ok) refresh();
    } finally {
      setMoveOpen(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className="relative flex shrink-0 items-center gap-1">
      <select
        value={task.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="max-w-[7rem] shrink-0 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs text-[var(--text)]"
        title="Change status"
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
        className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
        aria-label="Task actions"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] py-1 shadow-lg">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--bg-muted)]"
              onClick={() => {
                setMenuOpen(false);
                setEditOpen(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--bg-muted)]"
              onClick={() => {
                setMenuOpen(false);
                setMoveOpen(true);
              }}
            >
              Move to another sprint
            </button>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger-bg)]"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </>
      )}

      {editOpen && (
        <TaskEditModal
          task={task}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            refresh();
          }}
        />
      )}

      {moveOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setMoveOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 font-semibold text-[var(--text)]">
              Move to sprint
            </h3>
            <p className="mb-3 truncate text-sm text-[var(--text-secondary)]">
              {task.summary}
            </p>
            {otherSprints.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                No other sprints in this workspace.
              </p>
            ) : (
              <ul className="space-y-1">
                {otherSprints.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => handleMove(s.id)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--bg-muted)]"
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setMoveOpen(false)}
              className="btn-ghost mt-3 w-full text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskEditModal({
  task,
  onClose,
  onSaved,
}: {
  task: GanttTask;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [summary, setSummary] = useState(task.summary);
  const [status, setStatus] = useState(task.status);
  const [links, setLinks] = useState(task.links ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Task name is required");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summary.trim(),
          status,
          links: links.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
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
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-xl"
      >
        <h3 className="mb-4 font-semibold text-[var(--text)]">Edit task</h3>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Task name
          </span>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
          />
        </label>
        <label className="mb-3 block">
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
        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Links, screenshots (optional)
          </span>
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="One URL per line"
            rows={2}
            className="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
          />
        </label>
        {error && (
          <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
