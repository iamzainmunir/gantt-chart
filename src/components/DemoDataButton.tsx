"use client";

import { getDummyDataForStorage, DEMO_STORAGE_KEY, DEMO_SPRINTS_KEY, DEMO_WORKSPACES_KEY, DEMO_DETAILS_KEY } from "@/lib/dummyData";

export function DemoDataButton() {
  const loadDemo = () => {
    const data = getDummyDataForStorage();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_STORAGE_KEY, "1");
      window.localStorage.setItem(DEMO_SPRINTS_KEY, JSON.stringify(data.sprints));
      window.localStorage.setItem(DEMO_WORKSPACES_KEY, JSON.stringify(data.workspaces));
      window.localStorage.setItem(DEMO_DETAILS_KEY, JSON.stringify(data.sprintDetails));
      window.location.href = "/sprints?demo=1";
    }
  };

  return (
    <button
      type="button"
      onClick={loadDemo}
      className="btn-ghost inline-flex items-center gap-2 border border-[var(--border)]"
    >
      Use demo data (works offline)
    </button>
  );
}
