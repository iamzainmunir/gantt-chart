import type { PrismaClient } from "@prisma/client";

export type SpilloverResult = {
  taskId: string;
  sprintId: string;
  spilloverDays: number;
  resolvedAt: Date | null;
};

const DONE_STATUSES = ["Done", "done", "Closed", "closed"];

/**
 * Detect spillovers for a closed sprint: tasks that were in the sprint but
 * were not Done by sprint end, or were completed after sprint end.
 */
export async function detectSpillovers(
  prisma: PrismaClient,
  sprintId: string
): Promise<SpilloverResult[]> {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: { tasks: true },
  });
  if (!sprint) return [];
  const end = new Date(sprint.endDate);
  const now = new Date();
  if (end >= now) return []; // sprint not closed

  const results: SpilloverResult[] = [];
  for (const task of sprint.tasks) {
    const isDone = DONE_STATUSES.includes(task.status);
    const resolvedAt = task.resolvedAt ? new Date(task.resolvedAt) : null;
    const completedAfterEnd = resolvedAt ? resolvedAt > end : false;
    const isSpillover = !isDone || completedAfterEnd;
    if (!isSpillover) continue;

    let spilloverDays = 0;
    if (resolvedAt && resolvedAt > end) {
      spilloverDays = Math.ceil(
        (resolvedAt.getTime() - end.getTime()) / (24 * 60 * 60 * 1000)
      );
    } else if (!isDone) {
      spilloverDays = Math.ceil(
        (now.getTime() - end.getTime()) / (24 * 60 * 60 * 1000)
      );
    }
    results.push({
      taskId: task.id,
      sprintId,
      spilloverDays,
      resolvedAt: task.resolvedAt,
    });
  }
  return results;
}

/**
 * Ensure Spillover records exist for a sprint (idempotent).
 */
export async function ensureSpilloverRecords(
  prisma: PrismaClient,
  sprintId: string
): Promise<void> {
  const existing = await prisma.spillover.findMany({
    where: { sprintId },
  });
  const detected = await detectSpillovers(prisma, sprintId);
  const existingByTask = new Map(existing.map((e) => [e.taskId, e]));
  for (const d of detected) {
    const cur = existingByTask.get(d.taskId);
    if (cur) {
      await prisma.spillover.update({
        where: { id: cur.id },
        data: {
          spilloverDays: d.spilloverDays,
          resolvedAt: d.resolvedAt,
        },
      });
    } else {
      await prisma.spillover.create({
        data: {
          taskId: d.taskId,
          sprintId: d.sprintId,
          spilloverDays: d.spilloverDays,
          resolvedAt: d.resolvedAt,
        },
      });
    }
  }
}
