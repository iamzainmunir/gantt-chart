import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sprints = await prisma.sprint.findMany({
      orderBy: { startDate: "desc" },
      include: {
        workspace: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(sprints);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch sprints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, startDate, endDate, state } = body as {
      workspaceId: string;
      name: string;
      startDate: string;
      endDate?: string;
      state?: string;
    };
    if (!workspaceId || !name?.trim() || !startDate) {
      return NextResponse.json(
        { error: "workspaceId, name and startDate are required" },
        { status: 400 }
      );
    }
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }
    const start = new Date(startDate);
    const lengthDays = workspace.sprintLengthDays ?? 14;
    const end = endDate
      ? new Date(endDate)
      : (() => {
          const e = new Date(start);
          e.setDate(e.getDate() + lengthDays);
          return e;
        })();
    const sprint = await prisma.sprint.create({
      data: {
        workspaceId,
        name: name.trim(),
        startDate: start,
        endDate: end,
        state: state ?? "active",
      },
    });
    return NextResponse.json(sprint);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create sprint" },
      { status: 500 }
    );
  }
}
