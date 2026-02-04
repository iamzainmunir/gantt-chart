import type { PrismaClient } from "@prisma/client";

export type HealthBand = "healthy" | "at_risk" | "critical";

export type SprintHealthResult = {
  score: number;
  band: HealthBand;
  spilloverCount: number;
  spilloverDays: number;
  completedCount: number;
  totalCount: number;
};

/**
 * Compute sprint health score (0–100) and band.
 * Inputs: planned vs actual progress, spillover volume, blocked time.
 */
export async function computeSprintHealth(
  prisma: PrismaClient,
  sprintId: string
): Promise<SprintHealthResult> {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    include: {
      tasks: true,
      spillovers: true,
    },
  });
  if (!sprint) {
    return {
      score: 0,
      band: "critical",
      spilloverCount: 0,
      spilloverDays: 0,
      completedCount: 0,
      totalCount: 0,
    };
  }

  const totalCount = sprint.tasks.length;
  const doneStatuses = ["Done", "done", "Closed", "closed"];
  const completedCount = sprint.tasks.filter((t) =>
    doneStatuses.includes(t.status)
  ).length;
  const spilloverCount = sprint.spillovers.length;
  const spilloverDays = sprint.spillovers.reduce(
    (s, o) => s + o.spilloverDays,
    0
  );
  const blockedCount = sprint.tasks.filter((t) => t.blocked).length;

  let score = 100;
  if (totalCount > 0) {
    const completionRate = completedCount / totalCount;
    score -= (1 - completionRate) * 30;
  }
  score -= spilloverCount * 10;
  score -= Math.min(20, spilloverDays * 2);
  score -= blockedCount * 5;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const band: HealthBand =
    score >= 70 ? "healthy" : score >= 40 ? "at_risk" : "critical";

  return {
    score,
    band,
    spilloverCount,
    spilloverDays,
    completedCount,
    totalCount,
  };
}
