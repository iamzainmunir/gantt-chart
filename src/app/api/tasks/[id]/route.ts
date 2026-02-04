import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { startDate, endDate, order, status, summary, sprintId, links } = body as {
      startDate?: string;
      endDate?: string;
      order?: number;
      status?: string;
      summary?: string;
      sprintId?: string;
      links?: string;
    };

    const data: {
      startDate?: Date;
      endDate?: Date;
      order?: number;
      status?: string;
      summary?: string;
      sprintId?: string;
      links?: string | null;
    } = {};
    if (startDate != null) data.startDate = new Date(startDate);
    if (endDate != null) data.endDate = new Date(endDate);
    if (order != null) data.order = Number(order);
    if (status != null) data.status = String(status);
    if (summary != null) data.summary = String(summary);
    if (sprintId != null) data.sprintId = String(sprintId);
    if (links !== undefined) data.links = links === "" ? null : links;

    const task = await prisma.task.update({
      where: { id },
      data,
    });
    return NextResponse.json(task);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
