import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sprintId,
      summary,
      status,
      order,
      startDate,
      endDate,
      estimate,
      links,
    } = body as {
      sprintId: string;
      summary: string;
      status?: string;
      order?: number;
      startDate?: string;
      endDate?: string;
      estimate?: number;
      links?: string;
    };
    if (!sprintId || !summary?.trim()) {
      return NextResponse.json(
        { error: "sprintId and summary are required" },
        { status: 400 }
      );
    }
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) {
      return NextResponse.json(
        { error: "Sprint not found" },
        { status: 404 }
      );
    }
    const maxOrder = await prisma.task
      .aggregate({
        where: { sprintId },
        _max: { order: true },
      })
      .then((r) => r._max.order ?? 0);
    const taskStart = startDate != null ? new Date(startDate) : null;
    const taskEnd = endDate != null ? new Date(endDate) : null;
    const task = await prisma.task.create({
      data: {
        sprintId,
        summary: summary.trim(),
        status: status ?? "To Do",
        order: order ?? maxOrder + 1,
        startDate: taskStart,
        endDate: taskEnd,
        estimate: estimate ?? null,
        links: links != null && links.trim() !== "" ? links.trim() : null,
      },
    });
    return NextResponse.json(task);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
