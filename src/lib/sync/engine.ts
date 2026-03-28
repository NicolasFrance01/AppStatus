import { AppStatus, Platform } from "@/generated/client";
import prisma from "../db";
import { sendNotification } from "../notifications";
import { fetchAppleAppStatus } from "./apple";
import { fetchGoogleAppStatus } from "./google";
import { sendStatusAlertEmail } from "../email";
import { syncAllFirebaseApps } from "./firebase";

export async function syncAppStatus(appId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return;

  let newStatus: AppStatus = app.status;
  let newVersion: string | null = app.currentVersion;
  let newBuild: string | null = app.buildNumber;
  let newStoreStatus: string | null = app.storeStatus;
  let newUpdateStatus: string | null = app.updateStatus;

  // Real Integration for Apple
  if (app.platform === Platform.IOS && process.env.APPLE_KEY_ID) {
    try {
      console.log(`[Sync] Fetching REAL status for ${app.name} (${app.platform}) from Apple...`);
      const appleResult = await fetchAppleAppStatus(app.bundleId);
      newStatus = appleResult.status;
      newVersion = appleResult.version ?? null;
      newBuild = appleResult.build ?? null;
      newStoreStatus = appleResult.storeStatus ?? null;
      newUpdateStatus = appleResult.updateStatus ?? null;
    } catch (error) {
      console.error(`[Sync] Error fetching from Apple for ${app.name}:`, error);
      return;
    }
  } else if (app.platform === Platform.ANDROID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      console.log(`[Sync] Fetching REAL status for ${app.name} (${app.platform}) from Google Play...`);
      const googleResult = await fetchGoogleAppStatus(app.bundleId);
      newStatus = googleResult.status;
      newVersion = googleResult.version ?? null;
      newBuild = googleResult.build ?? null;
      newStoreStatus = googleResult.storeStatus ?? null;
      newUpdateStatus = googleResult.updateStatus ?? null;
    } catch (error) {
      console.error(`[Sync] Error fetching from Google for ${app.name}:`, error);
      return;
    }
  } else {
    // Fallback simulation if no credentials configured
    console.log(`[Sync] Fetching SIMULATED status for ${app.name} (${app.platform})...`);
    const shouldChange = Math.random() > 0.9;
    if (shouldChange) {
      const statuses: AppStatus[] = Object.values(AppStatus);
      newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    }
  }
  
  if (
    newStatus !== app.status || 
    newVersion !== app.currentVersion || 
    newBuild !== app.buildNumber ||
    newStoreStatus !== app.storeStatus ||
    newUpdateStatus !== app.updateStatus
  ) {
    const oldStatus = app.status;
    
    await prisma.$transaction([
      prisma.app.update({
        where: { id: appId },
        data: { 
          status: newStatus, 
          currentVersion: newVersion,
          buildNumber: newBuild,
          storeStatus: newStoreStatus,
          updateStatus: newUpdateStatus,
          lastUpdate: new Date() 
        }
      }),
      prisma.statusHistory.create({
        data: {
          appId: appId,
          oldStatus: oldStatus,
          newStatus: newStatus
        }
      })
    ]);

    // Create System Alert
    await prisma.alert.create({
      data: {
        type: 'STATUS_CHANGE',
        message: `La app ${app.name} cambió de ${oldStatus} a ${newStatus}`,
        metadata: { appId, oldStatus, newStatus, appName: app.name }
      }
    });

    // Send Email to Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length > 0) {
      await sendStatusAlertEmail(adminEmails, app.name, oldStatus, newStatus, app.platform, app.entity);
    }

    await sendNotification(app.name, oldStatus, newStatus);
  }
}

export async function syncAllApps(historyId?: string) {
  const apps = await prisma.app.findMany();
  const totalApps = apps.length;

  if (historyId) {
    await prisma.syncHistory.update({
      where: { id: historyId },
      data: { totalApps }
    });
  }

  let processedCount = 0;
  for (const app of apps) {
    try {
      await syncAppStatus(app.id);
    } catch (error) {
      console.error(`[Sync] error syncing app ${app.name}:`, error);
    }
    processedCount++;
    
    if (historyId) {
      await prisma.syncHistory.update({
        where: { id: historyId },
        data: { processedApps: processedCount }
      });
    }
  }

  if (historyId) {
    await prisma.syncHistory.update({
      where: { id: historyId },
      data: { 
        status: "COMPLETED",
        completedAt: new Date()
      }
    });
  }

  // Also sync all Firebase apps
  console.log(`[Sync] Starting Firebase apps sync...`);
  try {
    await syncAllFirebaseApps();
    console.log(`[Sync] Firebase sync completed.`);
  } catch (error) {
    console.error(`[Sync] Error syncing Firebase apps:`, error);
  }
}
