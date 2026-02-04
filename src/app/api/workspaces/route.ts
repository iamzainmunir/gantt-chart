import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDummyWorkspaces } from "@/lib/dummyData";

export async function GET() {
  if (!prisma) {
    return NextResponse.json(getDummyWorkspaces());
  }
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sprintLengthDays: true },
    });
    return NextResponse.json(workspaces);
  } catch (e) {
    console.error(e);
    return NextResponse.json(getDummyWorkspaces());
  }
}
