"use server";

import prisma from "@/lib/db";
import { AppStatus, Platform } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function seedMockData() {
  const mockApps = [
    // iOS Apps
    {
      name: "APP Banco San Juan",
      bundleId: "com.bancosanjuan.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.95.3",
      buildNumber: "1",
      lastUpdate: new Date(),
    },
    {
      name: "BSJ Empresas",
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
      bundleId: "com.bancosanjuan.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PUBLISHED,
      currentVersion: "1.0.0",
      buildNumber: "115",
      lastUpdate: new Date("2026-03-09"),
    },
    {
      name: "BSJ Empresas",
      bundleId: "com.empresasbsj.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PUBLISHED,
      currentVersion: "2.68.1",
      buildNumber: "1",
      lastUpdate: new Date("2026-02-24"),
    },
    // --- BSF (Banco Santa Fe) ---
    // iOS Apps
    {
      name: "APP Banco Santa Fe",
      bundleId: "com.bancosantafe.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
    },
    {
      name: "SF Empresas",
      bundleId: "com.empresasbsf.mobile",
      platform: Platform.IOS,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
    },
    // Android Apps
    {
      name: "APP Banco Santa Fe",
      bundleId: "com.bancosantafe.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
    },
    {
      name: "SF Empresas",
      bundleId: "com.empresasbsf.mobile",
      platform: Platform.ANDROID,
      status: AppStatus.PENDING_REVIEW,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
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
