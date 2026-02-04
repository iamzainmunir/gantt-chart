"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GanttChart, type GanttTask } from "@/components/gantt/GanttChart";
import { SprintTimelineEditor } from "./SprintTimelineEditor";
import { TaskPanelActions } from "./TaskPanelActions";
import { AddTaskModal } from "./AddTaskModal";

export type SprintGanttSectionProps = {
  sprintId: string;
  workspaceId: string;
  sprintStart: string;
  sprintEnd: string;
  tasks: Array<{
    id: string;
    summary: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    blocked?: boolean;
    links?: string | null;
  }>;
  spilloverTaskIds: string[];
  otherSprints: Array<{ id: string; name: string }>;
};

export function SprintGanttSection({
  sprintId,
  sprintStart,
  sprintEnd,
  tasks,
  spilloverTaskIds,
  otherSprints,
}: SprintGanttSectionProps) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const ganttTasks: GanttTask[] = tasks.map((t) => ({
    id: t.id,
    summary: t.summary,
    status: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    blocked: t.blocked,
    links: t.links,
  }));

  return (
    <section className="card rounded-xl p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-heading">Timeline</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Drag bars to reschedule; drag edges to change duration.
          </p>
        </div>
        <SprintTimelineEditor
          sprintId={sprintId}
          startDate={sprintStart}
          endDate={sprintEnd}
          onSaved={refresh}
        />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-muted)]">Bar colors:</span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded"
            style={{ backgroundColor: "var(--bar-spillover)" }}
            title="Past sprint end"
          />
          Spillover
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded"
            style={{ backgroundColor: "var(--bar-todo)" }}
          />
          To Do
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded"
            style={{ backgroundColor: "var(--bar-in-progress)" }}
          />
          In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded"
            style={{ backgroundColor: "var(--bar-review)" }}
          />
          In Review
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded"
            style={{ backgroundColor: "var(--bar-done)" }}
          />
          Done
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded"
            style={{ backgroundColor: "var(--bar-blocked)" }}
          />
          Blocked
        </span>
      </div>
      <GanttChart
        sprintStart={sprintStart}
        sprintEnd={sprintEnd}
        tasks={ganttTasks}
        width={900}
        editable
        spilloverTaskIds={spilloverTaskIds}
        onTaskSummaryChange={async (taskId, summary) => {
          await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary }),
          });
          refresh();
        }}
        addTaskButton={
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="rounded bg-[var(--accent)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Add task
          </button>
        }
        renderTaskActions={(task) => (
          <TaskPanelActions
            task={task}
            sprintId={sprintId}
            otherSprints={otherSprints}
            onRefresh={refresh}
          />
        )}
      />
      {addModalOpen && (
        <AddTaskModal
          sprintId={sprintId}
          sprintStart={sprintStart}
          sprintEnd={sprintEnd}
          onClose={() => setAddModalOpen(false)}
          onAdded={() => {
            setAddModalOpen(false);
            refresh();
          }}
        />
      )}
    </section>
  );
}
