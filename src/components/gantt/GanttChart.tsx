"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dateToX, xToDate } from "@/lib/gantt/utils";

export type GanttTask = {
  id: string;
  summary: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  blocked?: boolean;
  links?: string | null;
};

type GanttChartProps = {
  sprintStart: string;
  sprintEnd: string;
  tasks: GanttTask[];
  width?: number;
  rowHeight?: number;
  editable?: boolean;
  spilloverTaskIds?: string[];
  addTaskButton?: React.ReactNode;
  renderTaskActions?: (task: GanttTask) => React.ReactNode;
  onTaskSummaryChange?: (taskId: string, summary: string) => void | Promise<void>;
};

export function GanttChart({
  sprintStart,
  sprintEnd,
  tasks: initialTasks,
  width = 800,
  rowHeight = 36,
  editable = false,
  spilloverTaskIds = [],
  addTaskButton,
  renderTaskActions,
  onTaskSummaryChange,
}: GanttChartProps) {
  const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState("");
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const rangeStart = useMemo(() => new Date(sprintStart), [sprintStart]);
  const rangeEnd = useMemo(() => new Date(sprintEnd), [sprintEnd]);
  const totalDays = useMemo(
    () => (rangeEnd.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000),
    [rangeStart, rangeEnd]
  );

  const chartWidth = width - 220;

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: { startDate?: string; endDate?: string }
    ) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            startDate: updates.startDate ?? t.startDate ?? null,
            endDate: updates.endDate ?? t.endDate ?? null,
          };
        })
      );
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } catch {
        setTasks(initialTasks);
      }
    },
    [initialTasks]
  );

  const bars = useMemo(() => {
    return tasks.map((t) => {
      if (!t.startDate || !t.endDate) {
        return { task: t, x: 0, w: 0, visible: false };
      }
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      const x = dateToX(start, rangeStart, rangeEnd, chartWidth);
      const w = Math.max(4, dateToX(end, rangeStart, rangeEnd, chartWidth) - x);
      return { task: t, x, w, visible: true };
    });
  }, [tasks, rangeStart, rangeEnd, chartWidth]);

  const dayWidth = chartWidth / Math.max(1, totalDays);

  const getBarColor = (task: GanttTask, isSpillover: boolean) => {
    if (isSpillover) return "var(--bar-spillover)";
    const s = (task.status || "").toLowerCase();
    if (s.includes("done") || s.includes("closed")) return "var(--bar-done)";
    if (s.includes("progress")) return "var(--bar-in-progress)";
    if (s.includes("review") || s.includes("qa")) return "var(--bar-review)";
    if (task.blocked || s.includes("block")) return "var(--bar-blocked)";
    return "var(--bar-todo)";
  };

  const handleStartEditSummary = useCallback((task: GanttTask) => {
    setEditingTaskId(task.id);
    setEditingSummary(task.summary);
  }, []);

  const handleSaveSummary = useCallback(
    async (taskId: string) => {
      const value = editingSummary.trim();
      setEditingTaskId(null);
      if (!value) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.summary === value) return;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, summary: value } : t))
      );
      try {
        await onTaskSummaryChange?.(taskId, value);
      } catch {
        setTasks(initialTasks);
      }
    },
    [editingSummary, tasks, initialTasks, onTaskSummaryChange]
  );

  const today = useMemo(() => new Date(), []);
  const todayX =
    today >= rangeStart && today <= rangeEnd
      ? dateToX(today, rangeStart, rangeEnd, chartWidth)
      : null;

  const dayLabels = useMemo(() => {
    return Array.from({ length: Math.ceil(totalDays) + 1 }, (_, i) => {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      return {
        label: `${d.getDate()} ${d.toLocaleDateString(undefined, { weekday: "short" })}`,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      };
    });
  }, [rangeStart, totalDays]);

  return (
    <div className="gantt-chart overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-md">
      <div className="flex min-w-max text-sm" style={{ width }}>
        <div
          className="relative z-10 flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-muted)]/40"
          style={{ width: 220 }}
        >
          <div
            className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
            style={{ height: rowHeight }}
          >
            <span>Task</span>
            {addTaskButton}
          </div>
          {tasks.map((t, idx) => (
            <div
              key={t.id}
              className={`flex items-center gap-2 truncate border-b border-[var(--border-muted)] px-4 py-0 text-[var(--text)] transition-colors hover:bg-[var(--bg-muted)]/50 ${idx % 2 === 1 ? "bg-[var(--bg-muted)]/20" : ""}`}
              style={{ height: rowHeight }}
            >
              {editingTaskId === t.id ? (
                <input
                  type="text"
                  value={editingSummary}
                  onChange={(e) => setEditingSummary(e.target.value)}
                  onBlur={() => handleSaveSummary(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveSummary(t.id);
                    }
                    if (e.key === "Escape") {
                      setEditingTaskId(null);
                      setEditingSummary(t.summary);
                    }
                  }}
                  autoFocus
                  className="min-w-0 flex-1 rounded border border-[var(--accent)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-sm text-[var(--text)] outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="min-w-0 flex-1 truncate cursor-text rounded px-1 py-0.5 hover:bg-[var(--bg-muted)]"
                  title={`${t.summary} (double-click to edit)`}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    if (onTaskSummaryChange) handleStartEditSummary(t);
                  }}
                >
                  {t.summary}
                </span>
              )}
              {renderTaskActions?.(t)}
            </div>
          ))}
        </div>
        <div className="relative flex-1 min-w-0">
          <div
            className="flex border-b border-[var(--border)] bg-[var(--bg-muted)]/50 text-xs font-medium text-[var(--text-secondary)]"
            style={{ height: rowHeight }}
          >
            {dayLabels.map((day, i) => (
              <div
                key={i}
                className={`flex shrink-0 items-center justify-center border-r border-[var(--border-muted)] px-0.5 ${day.isWeekend ? "bg-[var(--bg-muted)]/40" : ""}`}
                style={{ width: dayWidth, minWidth: 36 }}
                title={day.label}
              >
                <span className="truncate text-center text-[11px] tabular-nums text-[var(--text-secondary)]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
          {todayX != null && (
            <div
              className="absolute top-0 bottom-0 z-[5] w-0.5 bg-[var(--accent)] opacity-80"
              style={{ left: todayX, pointerEvents: "none" }}
              title="Today"
            />
          )}
          {bars.map(({ task, x, w, visible }, idx) => (
            <div
              key={task.id}
              className={`relative border-b border-[var(--border-muted)] transition-colors ${idx % 2 === 1 ? "bg-[var(--bg-muted)]/15" : ""}`}
              style={{
                height: rowHeight,
                width: chartWidth,
              }}
            >
              {visible && w > 0 && (
                <GanttBar
                  taskId={task.id}
                  x={x}
                  w={w}
                  label={task.summary}
                  editable={editable}
                  isSpillover={spilloverTaskIds.includes(task.id)}
                  barColor={getBarColor(task, spilloverTaskIds.includes(task.id))}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  chartWidth={chartWidth}
                  onUpdate={updateTask}
                  rowHeight={rowHeight}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GanttBar({
  taskId,
  x,
  w,
  label,
  editable,
  isSpillover,
  barColor,
  rangeStart,
  rangeEnd,
  chartWidth,
  onUpdate,
  rowHeight,
}: {
  taskId: string;
  x: number;
  w: number;
  label: string;
  editable: boolean;
  isSpillover: boolean;
  barColor: string;
  rangeStart: Date;
  rangeEnd: Date;
  chartWidth: number;
  onUpdate: (
    taskId: string,
    updates: { startDate: string; endDate: string }
  ) => void;
  rowHeight: number;
}) {
  const [drag, setDrag] = useState<{
    mode: "move" | "left" | "right";
    startX: number;
    startBarX: number;
    startBarW: number;
  } | null>(null);
  const [local, setLocal] = useState<{ x: number; w: number } | null>(null);
  const pendingRef = useRef<{ x: number; w: number }>({ x, w });

  const displayX = local?.x ?? x;
  const displayW = local?.w ?? w;
  pendingRef.current = { x: displayX, w: displayW };

  useEffect(() => {
    if (!drag) return;
    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - drag.startX;
      if (drag.mode === "move") {
        const nx = Math.max(
          0,
          Math.min(chartWidth - drag.startBarW, drag.startBarX + deltaX)
        );
        setLocal({ x: nx, w: drag.startBarW });
      } else if (drag.mode === "left") {
        const newLeft = drag.startBarX + deltaX;
        const newW = drag.startBarW + (drag.startBarX - newLeft);
        if (newW >= 4) {
          setLocal({ x: Math.max(0, newLeft), w: newW });
        }
      } else {
        const newW = Math.max(4, drag.startBarW + deltaX);
        setLocal({ x: drag.startBarX, w: newW });
      }
    };
    const onMouseUp = () => {
      const { x: fx, w: fw } = pendingRef.current;
      const startDate = xToDate(fx, rangeStart, rangeEnd, chartWidth);
      const endDate = xToDate(fx + fw, rangeStart, rangeEnd, chartWidth);
      onUpdate(taskId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setDrag(null);
      setLocal(null);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drag, rangeStart, rangeEnd, chartWidth, taskId, onUpdate]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: "move" | "left" | "right") => {
      if (!editable) return;
      e.preventDefault();
      setDrag({
        mode,
        startX: e.clientX,
        startBarX: local?.x ?? x,
        startBarW: local?.w ?? w,
      });
    },
    [editable, x, w, local]
  );

  return (
    <div
      className="absolute top-1/2 flex h-7 -translate-y-1/2 cursor-default"
      style={{ left: displayX, width: displayW }}
    >
      {editable && (
        <div
          className="absolute left-0 z-10 w-2 cursor-ew-resize rounded-l border-r border-white/40 hover:bg-white/25"
          style={{ height: 28 }}
          onMouseDown={(e) => handleMouseDown(e, "left")}
        />
      )}
      <div
        className={`absolute left-0 flex h-7 items-center rounded-lg px-2 py-1 text-xs font-medium text-white shadow-md transition-all duration-200 ${
          editable ? "cursor-grab active:cursor-grabbing hover:opacity-95 hover:shadow-lg hover:ring-2 hover:ring-white/30" : ""
        }`}
        style={{
          left: editable ? 8 : 0,
          width: editable ? displayW - 16 : displayW,
          backgroundColor: barColor,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
        onMouseDown={(e) => editable && handleMouseDown(e, "move")}
      >
        <span className="block truncate drop-shadow-sm">{label}</span>
      </div>
      {editable && (
        <div
          className="absolute right-0 z-10 w-2 cursor-ew-resize rounded-r border-l border-white/40 hover:bg-white/25"
          style={{ height: 28, right: 0 }}
          onMouseDown={(e) => handleMouseDown(e, "right")}
        />
      )}
    </div>
  );
}
