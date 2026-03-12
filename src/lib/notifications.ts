import prisma from "./db";
import { AppStatus } from "@prisma/client";

export async function sendNotification(appName: string, oldStatus: AppStatus | null, newStatus: AppStatus) {
  const message = `App Status Change: ${appName} moved from ${oldStatus || 'NONE'} to ${newStatus}`;
  
  console.log(`[Notification] ${message}`);
  
  // Logic for Slack/Discord Webhooks would go here
  if (process.env.SLACK_WEBHOOK_URL) {
    // await fetch(process.env.SLACK_WEBHOOK_URL, { ... })
  }

  // Logic for Email (e.g. Resend) would go here
  if (process.env.RESEND_API_KEY) {
    // await resend.emails.send({ ... })
  }
}
