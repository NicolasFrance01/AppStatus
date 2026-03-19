import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    console.log("[API/sync/history] Debug context:", { 
      hasSession: !!session, 
      userEmail: session?.user?.email,
      userRole 
    });

    if (!session || userRole !== "ADMIN") {
      console.warn("[API/sync/history] Access denied for role:", userRole);
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const history = await prisma.syncHistory.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50 // Limit to last 50 syncs
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("[API/sync/history] Critical Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      modelExists: !!(prisma as any).syncHistory
    }, { status: 500 });
  }
}
