"use server";

import prisma from "@/lib/db";
import { AppStatus, Platform } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function seedMockData() {
  const mockApps = [
    {
      name: "AppStatus Pro",
      bundleId: "com.nicolasfrance.appstatus",
      platform: Platform.IOS,
      status: AppStatus.PUBLISHED,
      currentVersion: "1.2.0",
      buildNumber: "45",
      lastUpdate: new Date(),
    },
    {
      name: "Delivery Master",
      bundleId: "com.delivery.master.android",
      platform: Platform.ANDROID,
      status: AppStatus.IN_REVIEW,
      currentVersion: "2.0.1",
      buildNumber: "102",
      lastUpdate: new Date(),
    },
    {
      name: "Fitness Tracker",
      bundleId: "com.fitness.track.ios",
      platform: Platform.IOS,
      status: AppStatus.REJECTED,
      currentVersion: "0.9.5",
      buildNumber: "12",
      lastUpdate: new Date(),
      rejectionMessage: "Guideline 2.1 - Performance: App Completeness",
    },
    {
      name: "Finance Go",
      bundleId: "com.finance.go",
      platform: Platform.ANDROID,
      status: AppStatus.ACTION_REQUIRED,
      currentVersion: "1.0.0",
      buildNumber: "1",
      lastUpdate: new Date(),
    },
    {
      name: "Social Wave",
      bundleId: "com.social.wave.ios",
      platform: Platform.IOS,
      status: AppStatus.PENDING_PUBLICATION,
      currentVersion: "3.4.0",
      buildNumber: "289",
      lastUpdate: new Date(),
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
