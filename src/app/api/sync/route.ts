import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { syncAllApps } from "@/lib/sync/engine";
import prisma from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userName = session?.user?.name || session?.user?.email || "Unknown";

    if (!session || !["ADMIN", "DEVELOPER"].includes(userRole)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Create history record
    const history = await prisma.syncHistory.create({
      data: {
        triggeredBy: userName,
        totalApps: 0, // Will be updated in syncAllApps
        status: "IN_PROGRESS"
      }
    });

    console.log("[API/sync] Starting full sync triggered by:", userName);
    
    // Trigger sync in background or wait depending on requirements
    // For now, we wait to ensure complete response, but progress is tracked in DB
    try {
      await syncAllApps(history.id);
    } catch (syncError: any) {
      await prisma.syncHistory.update({
        where: { id: history.id },
        data: { 
          status: "FAILED",
          errorMessage: syncError.message,
          completedAt: new Date()
        }
      });
      throw syncError;
    }

    console.log("[API/sync] Sync completed successfully.");

    return NextResponse.json({ success: true, message: "Sincronización completada." });
  } catch (error: any) {
    console.error("[API/sync] Error during sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
