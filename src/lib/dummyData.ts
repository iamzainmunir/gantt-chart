/**
 * Dummy data for fallback when DB is unavailable (e.g. serverless deployment without DB)
 * or when user chooses "Use demo data" (localStorage).
 */
const WORKSPACE_ID = "demo-workspace-1";
const SPRINT_IDS = ["demo-sprint-1", "demo-sprint-2", "demo-sprint-3"] as const;

const workspace = {
  id: WORKSPACE_ID,
  name: "Sprint Planner Demo",
  sprintLengthDays: 14,
};

const tasksBySprint: Record<string, Array<{ id: string; summary: string; status: string; order: number; startDate: string; endDate: string; blocked?: boolean; links?: string | null }>> = {
  [SPRINT_IDS[0]]: [
    { id: "t1", summary: "User research and persona definition", status: "Done", order: 1, startDate: "2026-01-07", endDate: "2026-01-10", blocked: false, links: null },
    { id: "t2", summary: "Set up design system and component library", status: "Done", order: 2, startDate: "2026-01-08", endDate: "2026-01-12", blocked: false, links: null },
    { id: "t3", summary: "Implement SSO and role-based access control", status: "In Progress", order: 3, startDate: "2026-01-10", endDate: "2026-01-15", blocked: false, links: null },
    { id: "t4", summary: "Database schema design and migrations", status: "In Progress", order: 4, startDate: "2026-01-12", endDate: "2026-01-17", blocked: false, links: null },
    { id: "t5", summary: "API contract design and OpenAPI spec", status: "To Do", order: 5, startDate: "2026-01-13", endDate: "2026-01-19", blocked: false, links: null },
    { id: "t6", summary: "CI pipeline and staging environment setup", status: "To Do", order: 6, startDate: "2026-01-15", endDate: "2026-01-20", blocked: false, links: null },
  ],
  [SPRINT_IDS[1]]: [
    { id: "t7", summary: "REST API for projects and tasks", status: "In Progress", order: 1, startDate: "2026-01-21", endDate: "2026-01-25", blocked: false, links: null },
    { id: "t8", summary: "Dashboard and analytics endpoints", status: "In Progress", order: 2, startDate: "2026-01-23", endDate: "2026-01-27", blocked: false, links: null },
    { id: "t9", summary: "Frontend: project list and detail views", status: "In Progress", order: 3, startDate: "2026-01-25", endDate: "2026-01-30", blocked: false, links: null },
    { id: "t10", summary: "Real-time notifications with WebSockets", status: "To Do", order: 4, startDate: "2026-01-26", endDate: "2026-02-01", blocked: false, links: null },
    { id: "t11", summary: "Search and filter across entities", status: "To Do", order: 5, startDate: "2026-01-28", endDate: "2026-02-02", blocked: false, links: null },
    { id: "t12", summary: "Unit and integration test coverage", status: "To Do", order: 6, startDate: "2026-01-30", endDate: "2026-02-03", blocked: false, links: null },
  ],
  [SPRINT_IDS[2]]: [
    { id: "t13", summary: "Performance audit and query optimization", status: "To Do", order: 1, startDate: "2026-02-04", endDate: "2026-02-07", blocked: false, links: null },
    { id: "t14", summary: "Accessibility review and WCAG fixes", status: "To Do", order: 2, startDate: "2026-02-05", endDate: "2026-02-09", blocked: false, links: null },
    { id: "t15", summary: "Documentation and runbooks", status: "To Do", order: 3, startDate: "2026-02-06", endDate: "2026-02-11", blocked: false, links: null },
    { id: "t16", summary: "Security scan and dependency updates", status: "To Do", order: 4, startDate: "2026-02-07", endDate: "2026-02-13", blocked: false, links: null },
    { id: "t17", summary: "Launch checklist and go-live runbook", status: "To Do", order: 5, startDate: "2026-02-09", endDate: "2026-02-15", blocked: false, links: null },
    { id: "t18", summary: "Post-launch monitoring and alerting", status: "To Do", order: 6, startDate: "2026-02-11", endDate: "2026-02-17", blocked: false, links: null },
  ],
};

export type DummySprintListItem = {
  id: string;
  name: string;
  state: string;
  startDate: string;
  endDate: string;
  _count: { tasks: number };
  workspace: { id: string; name: string };
};

export function getDummySprints(): DummySprintListItem[] {
  return [
    { id: SPRINT_IDS[2], name: "Q1 Sprint 3: Polish & Launch", state: "active", startDate: "2026-02-04T00:00:00.000Z", endDate: "2026-02-17T00:00:00.000Z", _count: { tasks: 6 }, workspace: { id: workspace.id, name: workspace.name } },
    { id: SPRINT_IDS[1], name: "Q1 Sprint 2: Core Features", state: "closed", startDate: "2026-01-21T00:00:00.000Z", endDate: "2026-02-03T00:00:00.000Z", _count: { tasks: 6 }, workspace: { id: workspace.id, name: workspace.name } },
    { id: SPRINT_IDS[0], name: "Q1 Sprint 1: Discovery & Foundation", state: "closed", startDate: "2026-01-07T00:00:00.000Z", endDate: "2026-01-20T00:00:00.000Z", _count: { tasks: 6 }, workspace: { id: workspace.id, name: workspace.name } },
  ];
}

export function getDummyWorkspaces(): Array<{ id: string; name: string; sprintLengthDays?: number }> {
  return [{ id: workspace.id, name: workspace.name, sprintLengthDays: 14 }];
}

export function getDummySprintById(id: string): {
  id: string;
  name: string;
  state: string;
  startDate: string;
  endDate: string;
  workspace: { id: string; name: string };
  tasks: Array<{ id: string; summary: string; status: string; order: number; startDate: string | null; endDate: string | null; blocked?: boolean; links?: string | null }>;
  spillovers: Array<{ taskId: string }>;
  health: { score: number; band: string; spilloverCount: number; spilloverDays: number; completedCount: number; totalCount: number };
  prevSprintId: string | null;
  nextSprintId: string | null;
} | null {
  const idx = (SPRINT_IDS as readonly string[]).indexOf(id);
  if (idx === -1) return null;
  const tasks = tasksBySprint[id] ?? [];
  const completedCount = tasks.filter((t) => ["Done", "done"].includes(t.status)).length;
  const totalCount = tasks.length;
  const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const band = score >= 70 ? "healthy" : score >= 40 ? "at_risk" : "critical";
  return {
    id,
    name: getDummySprints().find((s) => s.id === id)!.name,
    state: getDummySprints().find((s) => s.id === id)!.state,
    startDate: idx === 0 ? "2026-01-07T00:00:00.000Z" : idx === 1 ? "2026-01-21T00:00:00.000Z" : "2026-02-04T00:00:00.000Z",
    endDate: idx === 0 ? "2026-01-20T00:00:00.000Z" : idx === 1 ? "2026-02-03T00:00:00.000Z" : "2026-02-17T00:00:00.000Z",
    workspace: { id: workspace.id, name: workspace.name },
    tasks: tasks.map((t) => ({ ...t, startDate: t.startDate, endDate: t.endDate })),
    spillovers: [],
    health: { score, band, spilloverCount: 0, spilloverDays: 0, completedCount, totalCount },
    prevSprintId: idx > 0 ? SPRINT_IDS[idx - 1] : null,
    nextSprintId: idx >= 0 && idx < SPRINT_IDS.length - 1 ? SPRINT_IDS[idx + 1] : null,
  };
}

export const DEMO_STORAGE_KEY = "simplied_sprint_planner_demo";
export const DEMO_SPRINTS_KEY = "simplied_sprint_planner_demo_sprints";
export const DEMO_WORKSPACES_KEY = "simplied_sprint_planner_demo_workspaces";
export const DEMO_DETAILS_KEY = "simplied_sprint_planner_demo_details";

export function getDummyDataForStorage() {
  return {
    sprints: getDummySprints(),
    workspaces: getDummyWorkspaces(),
    sprintDetails: SPRINT_IDS.reduce((acc, id) => {
      const s = getDummySprintById(id);
      if (s) acc[id] = s;
      return acc;
    }, {} as Record<string, ReturnType<typeof getDummySprintById>>),
  };
}
