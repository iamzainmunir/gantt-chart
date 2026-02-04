import { prisma } from "../src/lib/db";

async function main() {
  const existing = await prisma.workspace.findFirst({
    where: { name: "SprintMind Demo" },
  });
  if (existing) {
    console.log("Seed already applied (SprintMind Demo workspace exists).");
    return;
  }

  const workspace = await prisma.workspace.create({
    data: { name: "SprintMind Demo" },
  });

  const now = new Date();

  // --- Closed sprint with spillover tasks (ended in the past) ---
  const closedSprintStart = new Date(now);
  closedSprintStart.setDate(closedSprintStart.getDate() - 28);
  const closedSprintEnd = new Date(now);
  closedSprintEnd.setDate(closedSprintEnd.getDate() - 14); // ended 2 weeks ago

  const closedSprint = await prisma.sprint.create({
    data: {
      name: "Sprint 0 – January",
      state: "closed",
      startDate: closedSprintStart,
      endDate: closedSprintEnd,
      workspaceId: workspace.id,
    },
  });

  const closedSprintTaskDefs = [
    { start: 0, end: 3, summary: "Migrate legacy auth to OAuth2", status: "Done" },
    { start: 2, end: 6, summary: "Replace deprecated payment SDK", status: "In Progress" }, // spillover
    { start: 4, end: 10, summary: "Audit and fix security headers", status: "To Do" }, // spillover
  ];

  for (let i = 0; i < closedSprintTaskDefs.length; i++) {
    const d = closedSprintTaskDefs[i];
    const taskStart = new Date(closedSprintStart);
    taskStart.setDate(taskStart.getDate() + d.start);
    const taskEnd = new Date(closedSprintStart);
    taskEnd.setDate(taskEnd.getDate() + d.end);
    await prisma.task.create({
      data: {
        summary: d.summary,
        estimate: (d.end - d.start) * 2,
        status: d.status,
        order: i + 1,
        startDate: taskStart,
        endDate: taskEnd,
        sprintId: closedSprint.id,
      },
    });
  }

  // --- Active sprint ---
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  const sprint = await prisma.sprint.create({
    data: {
      name: "Sprint 1 – February",
      state: "active",
      startDate,
      endDate,
      workspaceId: workspace.id,
    },
  });

  const taskDefs = [
    { start: 0, end: 2, summary: "Implement user authentication flow", status: "In Progress" },
    { start: 1, end: 4, summary: "Setup CI/CD pipeline for staging", status: "In Progress" },
    { start: 3, end: 6, summary: "Design and implement dashboard API", status: "In Progress" },
    { start: 5, end: 10, summary: "Add export to PDF for reports", status: "To Do" },
    { start: 7, end: 12, summary: "Refactor notification service", status: "To Do" },
    { start: 2, end: 5, summary: "Write E2E tests for checkout flow", status: "To Do" },
    { start: 4, end: 8, summary: "Fix accessibility issues in sidebar", status: "To Do" },
  ];

  for (let i = 0; i < taskDefs.length; i++) {
    const d = taskDefs[i];
    const taskStart = new Date(startDate);
    taskStart.setDate(taskStart.getDate() + d.start);
    const taskEnd = new Date(startDate);
    taskEnd.setDate(taskEnd.getDate() + d.end);
    await prisma.task.create({
      data: {
        summary: d.summary,
        estimate: (d.end - d.start) * 2,
        status: d.status,
        order: i + 1,
        startDate: taskStart,
        endDate: taskEnd,
        sprintId: sprint.id,
      },
    });
  }

  console.log("Seed complete: workspace, 2 sprints (1 closed with 2 spillover tasks, 1 active), 10 tasks.");
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
