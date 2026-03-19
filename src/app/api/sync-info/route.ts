import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const latestSync = await prisma.syncHistory.findFirst({
      orderBy: { startedAt: 'desc' }
    });

    return NextResponse.json(latestSync || null);
  } catch (error: any) {
    console.error("[API/sync-info] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
