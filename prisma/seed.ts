import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing data...");
  await prisma.spillover.deleteMany();
  await prisma.aISprintInsight.deleteMany();
  await prisma.sprintMetrics.deleteMany();
  await prisma.task.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: "Sprint Planner Demo", sprintLengthDays: 14 },
  });

  // 3 sprints of 2 weeks each, starting Jan 7, 2026
  const sprintDefs = [
    {
      name: "Q1 Sprint 1: Discovery & Foundation",
      startDate: new Date("2026-01-07"),
      endDate: new Date("2026-01-20"),
    },
    {
      name: "Q1 Sprint 2: Core Features",
      startDate: new Date("2026-01-21"),
      endDate: new Date("2026-02-03"),
    },
    {
      name: "Q1 Sprint 3: Polish & Launch",
      startDate: new Date("2026-02-04"),
      endDate: new Date("2026-02-17"),
    },
  ];

  for (const def of sprintDefs) {
    const sprint = await prisma.sprint.create({
      data: {
        name: def.name,
        state: "active",
        startDate: def.startDate,
        endDate: def.endDate,
        workspaceId: workspace.id,
      },
    });

    const taskDefs = getTasksForSprint(def.name);
    for (let i = 0; i < taskDefs.length; i++) {
      const t = taskDefs[i];
      const taskStart = new Date(def.startDate);
      taskStart.setDate(taskStart.getDate() + t.start);
      const taskEnd = new Date(def.startDate);
      taskEnd.setDate(taskEnd.getDate() + t.end);
      await prisma.task.create({
        data: {
          summary: t.summary,
          status: t.status,
          order: i + 1,
          startDate: taskStart,
          endDate: taskEnd,
          estimate: (t.end - t.start) * 2,
          sprintId: sprint.id,
        },
      });
    }
  }

  console.log("Seed complete: 1 workspace, 3 sprints (2 weeks each from Jan 7 2026), with realistic tasks.");
}

function getTasksForSprint(sprintName: string): Array<{ start: number; end: number; summary: string; status: string }> {
  if (sprintName.includes("Sprint 1")) {
    return [
      { start: 0, end: 3, summary: "User research and persona definition", status: "Done" },
      { start: 1, end: 5, summary: "Set up design system and component library", status: "Done" },
      { start: 3, end: 8, summary: "Implement SSO and role-based access control", status: "In Progress" },
      { start: 5, end: 10, summary: "Database schema design and migrations", status: "In Progress" },
      { start: 6, end: 12, summary: "API contract design and OpenAPI spec", status: "To Do" },
      { start: 8, end: 14, summary: "CI pipeline and staging environment setup", status: "To Do" },
    ];
  }
  if (sprintName.includes("Sprint 2")) {
    return [
      { start: 0, end: 4, summary: "REST API for projects and tasks", status: "In Progress" },
      { start: 2, end: 6, summary: "Dashboard and analytics endpoints", status: "In Progress" },
      { start: 4, end: 9, summary: "Frontend: project list and detail views", status: "In Progress" },
      { start: 5, end: 11, summary: "Real-time notifications with WebSockets", status: "To Do" },
      { start: 7, end: 12, summary: "Search and filter across entities", status: "To Do" },
      { start: 9, end: 14, summary: "Unit and integration test coverage", status: "To Do" },
    ];
  }
  // Sprint 3
  return [
    { start: 0, end: 3, summary: "Performance audit and query optimization", status: "To Do" },
    { start: 1, end: 5, summary: "Accessibility review and WCAG fixes", status: "To Do" },
    { start: 3, end: 8, summary: "Documentation and runbooks", status: "To Do" },
    { start: 4, end: 10, summary: "Security scan and dependency updates", status: "To Do" },
    { start: 6, end: 12, summary: "Launch checklist and go-live runbook", status: "To Do" },
    { start: 8, end: 14, summary: "Post-launch monitoring and alerting", status: "To Do" },
  ];
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
