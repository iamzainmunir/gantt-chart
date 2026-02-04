import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const latest = await prisma.aISprintInsight.findFirst({
    where: { sprintId: id },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) {
    return NextResponse.json({ insight: null });
  }
  let spilloverClassifications: Array<{ taskSummary: string; reason: string }> =
    [];
  if (latest.spilloverNotes) {
    try {
      spilloverClassifications = JSON.parse(latest.spilloverNotes) as Array<{
        taskSummary: string;
        reason: string;
      }>;
    } catch {
      // ignore
    }
  }
  return NextResponse.json({
    insight: {
      id: latest.id,
      summary: latest.summary,
      spilloverClassifications,
      provider: latest.provider,
      model: latest.model,
      createdAt: latest.createdAt,
    },
  });
}
