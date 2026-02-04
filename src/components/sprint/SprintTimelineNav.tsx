"use client";

import Link from "next/link";
import { useState } from "react";
import { NewSprintModal } from "./NewSprintModal";

type Workspace = { id: string; name: string; sprintLengthDays?: number };

type Props = {
  prevSprintId: string | null;
  nextSprintId: string | null;
  sprintEndDate: string;
  workspaceId: string;
  isClosed: boolean;
  workspaces: Workspace[];
};

export function SprintTimelineNav({
  prevSprintId,
  nextSprintId,
  sprintEndDate,
  workspaceId,
  isClosed,
  workspaces,
}: Props) {
  const [newSprintOpen, setNewSprintOpen] = useState(false);
  const nextStartDate = (() => {
    const end = new Date(sprintEndDate);
    end.setDate(end.getDate() + 1);
    return end.toISOString().slice(0, 10);
  })();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {prevSprintId && (
        <Link
          href={`/sprints/${prevSprintId}`}
          className="btn-ghost inline-flex items-center gap-1 text-sm"
        >
          ← Previous sprint
        </Link>
      )}
      {nextSprintId && (
        <Link
          href={`/sprints/${nextSprintId}`}
          className="btn-ghost inline-flex items-center gap-1 text-sm"
        >
          Next sprint →
        </Link>
      )}
      {isClosed && workspaces.length > 0 && (
        <button
          type="button"
          onClick={() => setNewSprintOpen(true)}
          className="btn-primary inline-flex items-center gap-1 text-sm"
        >
          Start next sprint
        </button>
      )}
      {newSprintOpen && (
        <NewSprintModal
          workspaces={workspaces}
          onClose={() => setNewSprintOpen(false)}
          suggestedStartDate={nextStartDate}
          suggestedWorkspaceId={workspaceId}
        />
      )}
    </div>
  );
}
