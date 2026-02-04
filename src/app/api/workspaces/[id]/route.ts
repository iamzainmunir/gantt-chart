import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database is disabled. Set USE_DATABASE=true to enable." },
      { status: 503 }
    );
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const { sprintLengthDays } = body as { sprintLengthDays?: number };
    if (sprintLengthDays !== undefined) {
      const days = Number(sprintLengthDays);
      if (days !== 7 && days !== 14) {
        return NextResponse.json(
          { error: "sprintLengthDays must be 7 or 14" },
          { status: 400 }
        );
      }
      await prisma.workspace.update({
        where: { id },
        data: { sprintLengthDays: days },
      });
    }
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true, name: true, sprintLengthDays: true },
    });
    return NextResponse.json(workspace);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    );
  }
}
