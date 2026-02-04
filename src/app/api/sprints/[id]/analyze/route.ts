import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/ollama";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!prisma) {
    return NextResponse.json(
      { error: "Database is disabled. Set USE_DATABASE=true to enable." },
      { status: 503 }
    );
  }
  const db = prisma;
  const provider = getAIProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "AI not configured. Set OLLAMA_BASE_URL (default http://localhost:11434) and run Ollama with a model (e.g. ollama run llama3.2).",
      },
      { status: 503 }
    );
  }

  try {
    const sprint = await db.sprint.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { order: "asc" } },
        spillovers: { include: { task: true } },
      },
    });
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }

    const doneStatuses = ["Done", "done", "Closed", "closed"];
    const completedCount = sprint.tasks.filter((t) =>
      doneStatuses.includes(t.status)
    ).length;
    const health = await import("@/lib/metrics/sprintHealth").then((m) =>
      m.computeSprintHealth(db, id)
    );

    const input = {
      sprintName: sprint.name,
      startDate: sprint.startDate.toISOString().slice(0, 10),
      endDate: sprint.endDate.toISOString().slice(0, 10),
      state: sprint.state,
      taskCount: sprint.tasks.length,
      completedCount,
      spilloverCount: sprint.spillovers.length,
      healthScore: health.score,
      healthBand: health.band,
      tasks: sprint.tasks.map((t) => ({
        summary: t.summary,
        status: t.status,
        blocked: t.blocked,
      })),
      spilloverTaskSummaries: sprint.spillovers.map(
        (s) => s.task?.summary ?? "Unknown"
      ),
    };

    const result = await provider.analyzeSprint(input);

    const spilloverNotes = JSON.stringify(
      result.spilloverClassifications ?? []
    );
    await db.aISprintInsight.create({
      data: {
        sprintId: id,
        summary: result.summary,
        spilloverNotes,
        provider: provider.name,
        model: process.env.OLLAMA_MODEL ?? undefined,
      },
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "AI analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
