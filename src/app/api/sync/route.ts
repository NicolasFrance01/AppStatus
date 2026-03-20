/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { syncAllApps } from "@/lib/sync/engine";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  return handleSync(req);
}

export async function POST(req: Request) {
  return handleSync(req);
}

async function handleSync(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isTask = searchParams.get('task') === 'true';
    const authHeader = req.headers.get('Authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    let triggeredBy = "Unknown";
    let isAllowed = false;

    if (isCron) {
      triggeredBy = "Automatizado";
      isAllowed = true;
    } else if (isTask) {
      // Internal Scheduler Check
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (!config || !config.autoSyncEnabled) {
        return NextResponse.json({ success: false, message: "Auto-sync desactivado" });
      }

      const now = new Date();
      const lastSync = config.lastAutoSyncAt;
      const intervalMs = config.syncIntervalMinutes * 60 * 1000;

      if (now.getTime() - lastSync.getTime() < intervalMs) {
        return NextResponse.json({ success: false, message: "Sincronización no requerida aún" });
      }

      triggeredBy = "Automatizado";
      isAllowed = true;

      // Update timestamp immediately to prevent race conditions
      await prisma.systemConfig.update({
        where: { id: 'singleton' },
        data: { lastAutoSyncAt: now }
      });
    } else {
      const session = await getServerSession(authOptions);
      const user = session?.user as { role?: string; name?: string | null; email?: string } | undefined;
      if (session && ["ADMIN", "DEVELOPER"].includes(user?.role || "")) {
        triggeredBy = user?.name || user?.email || "Unknown";
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Create history record
    const history = await prisma.syncHistory.create({
      data: {
        triggeredBy: triggeredBy,
        totalApps: 0, 
        status: "IN_PROGRESS"
      }
    });

    console.log(`[API/sync] Starting full sync triggered by: ${triggeredBy}`);
    
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
    return NextResponse.json({ success: true, message: `Sincronización completada por ${triggeredBy}.` });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[API/sync] Error during sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
