import { AppStatus, Platform } from "@prisma/client";
import prisma from "../db";
import { sendNotification } from "../notifications";

export async function syncAppStatus(appId: string) {
  const app = await prisma.app.findUnique({ where: { id: appId } });
  if (!app) return;

  // Simulate API Call to Store
  console.log(`[Sync] Fetching status for ${app.name} (${app.platform})...`);
  
  // In a real implementation, this would use the logic from api_research.md
  // For now, we simulate a status change 10% of the time
  const shouldChange = Math.random() > 0.9;
  
  if (shouldChange) {
    const statuses: AppStatus[] = Object.values(AppStatus);
    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (newStatus !== app.status) {
      const oldStatus = app.status;
      
      await prisma.$transaction([
        prisma.app.update({
          where: { id: appId },
          data: { status: newStatus, lastUpdate: new Date() }
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
}

export async function syncAllApps() {
  const apps = await prisma.app.findMany();
  for (const app of apps) {
    await syncAppStatus(app.id);
  }
}
