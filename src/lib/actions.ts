"use server";

import prisma from "@/lib/db";
import { AppStatus, Platform } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function seedMockData() {
  const mockApps = [
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
      platform: Platform.ANDROID,
      status: AppStatus.PUBLISHED,
      currentVersion: "2.68.1",
      buildNumber: "1",
      lastUpdate: new Date("2026-02-24"),
    },
    {
      name: "APP Banco San Juan",
      bundleId: "com.bancosanjuan.mobile.android",
      platform: Platform.ANDROID,
      status: AppStatus.PUBLISHED,
      currentVersion: "1.0.0",
      buildNumber: "115",
      lastUpdate: new Date("2026-03-09"),
    },
    {
      name: "4U BSJ",
      bundleId: "com.mobilenik.foru.bsj",
      platform: Platform.ANDROID,
      status: AppStatus.STORE_ISSUES,
      currentVersion: "1.0.0",
      buildNumber: "0",
      lastUpdate: new Date("2019-10-18"),
      rejectionMessage: "Retirada por Google",
    }
  ];

  for (const app of mockApps) {
    await prisma.app.upsert({
      where: { bundleId: app.bundleId },
      update: app,
      create: app,
    });
  }

  revalidatePath("/");
}
