import { AppStatus, Platform } from "@prisma/client";
import prisma from "../db";
import { sendNotification } from "../notifications";
import { fetchAppleAppStatus } from "./apple";

export async function syncAppStatus(appId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return;

  let newStatus: AppStatus = app.status;
  let newVersion: string | null = app.currentVersion;
  let newBuild: string | null = app.buildNumber;

  // Real Integration for Apple
  if (app.platform === Platform.IOS && process.env.APPLE_KEY_ID) {
    try {
      console.log(`[Sync] Fetching REAL status for ${app.name} (${app.platform}) from Apple...`);
      const appleResult = await fetchAppleAppStatus(app.bundleId);
      newStatus = appleResult.status;
      newVersion = appleResult.version;
      newBuild = appleResult.build;
    } catch (error) {
      console.error(`[Sync] Error fetching from Apple for ${app.name}:`, error);
      return;
    }
  } else {
    // Simulate API Call to Store for others or if no credentials
    console.log(`[Sync] Fetching SIMULATED status for ${app.name} (${app.platform})...`);
    
    // In a real implementation for Google, we would add a google.ts similar to apple.ts
    const shouldChange = Math.random() > 0.9;
    if (shouldChange) {
      const statuses: AppStatus[] = Object.values(AppStatus);
      newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    }
  }
  
  if (newStatus !== app.status || newVersion !== app.currentVersion) {
    const oldStatus = app.status;
    
    await prisma.$transaction([
      prisma.app.update({
        where: { id: appId },
        data: { 
          status: newStatus, 
          currentVersion: newVersion,
          buildNumber: newBuild,
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

    await sendNotification(app.name, oldStatus, newStatus);
  }
}

export async function syncAllApps() {
  const apps = await prisma.app.findMany();
  for (const app of apps) {
    await syncAppStatus(app.id);
  }
}
