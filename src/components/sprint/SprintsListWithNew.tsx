"use client";

import { useState } from "react";
import { NewSprintModal } from "./NewSprintModal";

type Workspace = { id: string; name: string };

type Props = {
  workspaces: Workspace[];
};

export function SprintsListWithNew({ workspaces }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="btn-primary inline-flex items-center gap-2"
      >
        <span aria-hidden>+</span>
        Start new sprint
      </button>
      {modalOpen && (
        <NewSprintModal
          workspaces={workspaces}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
