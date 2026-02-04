import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sprintLengthDays: true },
    });
    return NextResponse.json(workspaces);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}
