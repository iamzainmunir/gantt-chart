import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSpilloverRecords } from "@/lib/metrics/spillover";
import { computeSprintHealth } from "@/lib/metrics/sprintHealth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { startDate, endDate, name, state } = body as {
      startDate?: string;
      endDate?: string;
      name?: string;
      state?: string;
    };
    const data: {
      startDate?: Date;
      endDate?: Date;
      name?: string;
      state?: string;
    } = {};
    if (startDate != null) data.startDate = new Date(startDate);
    if (endDate != null) data.endDate = new Date(endDate);
    if (name != null) data.name = String(name);
    if (state != null) data.state = String(state);
    const sprint = await prisma.sprint.update({
      where: { id },
      data,
    });
    return NextResponse.json(sprint);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update sprint" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const sprint = await prisma.sprint.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, name: true } },
        tasks: { orderBy: { order: "asc" } },
        spillovers: true,
      },
    });
    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 });
    }
    await ensureSpilloverRecords(prisma, id);
    const [health, spillovers, siblingSprints] = await Promise.all([
      computeSprintHealth(prisma, id),
      prisma.spillover.findMany({ where: { sprintId: id } }),
      prisma.sprint.findMany({
        where: { workspaceId: sprint.workspaceId },
        orderBy: { startDate: "asc" },
        select: { id: true, startDate: true, endDate: true, state: true },
      }),
    ]);
    const currentIdx = siblingSprints.findIndex(
      (s: { id: string }) => s.id === id
    );
    const prevSprintId =
      currentIdx > 0 ? siblingSprints[currentIdx - 1].id : null;
    const isViewingClosedSprint =
      sprint.state.toLowerCase() === "closed" ||
      new Date(sprint.endDate) < new Date();
    const nextSprintId =
      isViewingClosedSprint && currentIdx >= 0 && currentIdx < siblingSprints.length - 1
        ? siblingSprints[currentIdx + 1].id
        : null;
    return NextResponse.json({
      ...sprint,
      spillovers,
      health,
      prevSprintId,
      nextSprintId,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sprint" },
      { status: 500 }
    );
  }
}
