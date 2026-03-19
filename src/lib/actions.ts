"use server";

import prisma from "@/lib/db";
import { AppStatus, Platform } from "@/generated/client";
import { revalidatePath } from "next/cache";
import { syncAllApps } from "./sync/engine";

export async function seedMockData() {
  const mockApps = [
    // iOS Apps
    {
      name: "APP Banco San Juan",
      entity: "Banco San Juan",
      bundleId: "com.bancosanjuan.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.95.3",
      buildNumber: "1",
      lastUpdate: new Date(),
    },
    {
      name: "BSJ Empresas",
      entity: "Banco San Juan",
      bundleId: "com.empresasbsj.mobile",
      platform: Platform.IOS,
      status: AppStatus.PUBLISHED,
      currentVersion: "2.68.1",
      buildNumber: "1",
      lastUpdate: new Date("2026-02-24"),
    },
    // Android Apps
    {
      name: "APP Banco San Juan",
      entity: "Banco San Juan",
      bundleId: "com.bancosanjuan.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PUBLISHED,
      currentVersion: "1.0.0",
      buildNumber: "115",
      lastUpdate: new Date("2026-03-09"),
      storeStatus: "Producción",
      updateStatus: "Publicado",
    },
    {
      name: "BSJ Empresas",
      entity: "Banco San Juan",
      bundleId: "com.empresasbsj.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PUBLISHED,
      currentVersion: "2.68.1",
      buildNumber: "1",
      lastUpdate: new Date("2026-02-24"),
      storeStatus: "Producción",
      updateStatus: "Publicado",
    },
    // --- BSF (Banco Santa Fe) ---
    // iOS Apps
    {
      name: "APP Banco Santa Fe",
      entity: "Banco Santa Fe",
      bundleId: "com.bancosantafe.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Pendiente de revisión",
    },
    {
      name: "SF Empresas",
      entity: "Banco Santa Fe",
      bundleId: "com.empresasbsf.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Pendiente de revisión",
    },
    // Android Apps
    {
      name: "APP Banco Santa Fe",
      entity: "Banco Santa Fe",
      bundleId: "com.bancosantafe.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Lista para publicarse",
    },
    // --- BER (Banco Entre Ríos) ---
    {
      name: "APP Banco Entre Ríos",
      entity: "Banco Entre Ríos",
      bundleId: "com.bancoentrerios.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Pendiente de envío",
    },
    {
      name: "BER Empresas",
      entity: "Banco Entre Ríos",
      bundleId: "com.empresasbersa.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Pendiente de envío",
    },
    {
      name: "APP Banco Entre Ríos",
      entity: "Banco Entre Ríos",
      bundleId: "com.bancoentrerios.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Lista para publicarse",
    },
    {
      name: "BER Empresas",
      entity: "Banco Entre Ríos",
      bundleId: "com.empresasbersa.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Lista para publicarse",
    },
    // --- BSC (Banco Santa Cruz) ---
    {
      name: "APP Banco Santa Cruz",
      entity: "Banco Santa Cruz",
      bundleId: "com.bancosantacruz.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Pendiente de envío",
    },
    {
      name: "BSC Empresas",
      entity: "Banco Santa Cruz",
      bundleId: "com.empresasbsc.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Pendiente de envío",
    },
    {
      name: "APP Banco Santa Cruz",
      entity: "Banco Santa Cruz",
      bundleId: "com.bancosantacruz.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Lista para publicarse",
    },
    {
      name: "BSC Empresas",
      entity: "Banco Santa Cruz",
      bundleId: "com.empresasbsc.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
      storeStatus: "Producción",
      updateStatus: "Lista para publicarse",
    },
  ];

  for (const app of mockApps) {
    await prisma.app.upsert({
      where: { bundleId_platform: { bundleId: app.bundleId, platform: app.platform } },
      update: app,
      create: app,
    });
  }

  revalidatePath("/");
}

export async function syncAllAppsAction() {
  console.log("[Action] Triggering full sync...");
  await syncAllApps();
  revalidatePath("/");
}
