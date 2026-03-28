import { google } from 'googleapis';
import prisma from '../db';
import { Platform } from '@/generated/client';

const appdistribution = google.firebaseappdistribution('v1');

function getServiceAccountJson(bank: string): string | undefined {
  const b = bank.toLowerCase();
  if (b.includes('san juan') || b.includes('bsj')) return process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (b.includes('santa fe') || b.includes('bsf')) return process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (b.includes('entre r') || b.includes('ber')) return process.env.GOOGLE_BER_SERVICE_ACCOUNT_JSON;
  if (b.includes('santa cruz') || b.includes('bsc')) return process.env.GOOGLE_BSC_SERVICE_ACCOUNT_JSON;
  return undefined;
}

async function getAuthClient(bank: string) {
  let jsonStr = getServiceAccountJson(bank);
  if (!jsonStr) throw new Error(`No service account found for bank: ${bank}`);
  
  // Strip single quotes if present (sometimes added by dotenv or manual .env editing)
  if (jsonStr.startsWith("'") && jsonStr.endsWith("'")) {
    jsonStr = jsonStr.substring(1, jsonStr.length - 1);
  }
  
  const credentials = JSON.parse(jsonStr);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  
  return auth;
}

export async function syncFirebaseApp(appId: string) {
  const app = await prisma.firebaseApp.findUnique({ where: { id: appId } });
  if (!app) return;

  try {
    const auth = await getAuthClient(app.bank);
    const projectNumber = app.firebaseAppId.split(':')[1];
    const parent = `projects/${projectNumber}/apps/${app.firebaseAppId}`;

    console.log(`[FirebaseSync] Fetching releases for ${app.name} (${app.platform}) using v1...`);
    
    const response = await appdistribution.projects.apps.releases.list({
      parent,
      auth: auth as any,
      pageSize: 20,
    });

    const releases = response.data.releases || [];
    console.log(`[FirebaseSync] Found ${releases.length} releases for ${app.name}.`);
    
    for (const release of releases) {
      console.log(`[FirebaseSync] Release ${release.displayVersion}: createTime=${release.createTime}`);
      if (!release.displayVersion || !release.buildVersion) continue;

      const externalId = release.name || '';
      const existing = await prisma.firebaseRelease.findUnique({
        where: { externalId }
      });

      // Until we find a way to fetch real metrics per release via v1, we use 0 or common project stats
      const testerCount = 0;
      const acceptedCount = 0;
      const downloadedCount = 0;
      const releaseNotes = (release.releaseNotes as any)?.text || (release as any).releaseNotes || '';

      await prisma.firebaseRelease.upsert({
        where: { externalId },
        create: {
          externalId,
          firebaseAppId: app.id,
          version: release.displayVersion,
          buildNumber: release.buildVersion,
          releaseNotes,
          displayDate: release.createTime ? new Date(release.createTime) : new Date(),
          invitedCount: testerCount,
          acceptedCount: acceptedCount,
          downloadedCount: downloadedCount,
        },
        update: {
          version: release.displayVersion,
          buildNumber: release.buildVersion,
          releaseNotes,
          displayDate: release.createTime ? new Date(release.createTime) : new Date(),
          invitedCount: testerCount,
          acceptedCount: acceptedCount,
          downloadedCount: downloadedCount,
        }
      });

      if (!existing) {
        console.log(`[FirebaseSync] NEW RELEASE detected: ${release.displayVersion} (${release.buildVersion}) for ${app.name}`);
        
        // Create System Alert
        await prisma.alert.create({
          data: {
            type: 'STATUS_CHANGE',
            message: `Nueva versión Firebase: ${app.name} v${release.displayVersion} (${release.buildVersion})`,
            metadata: { 
              appId: app.id, 
              appName: app.name, 
              version: release.displayVersion, 
              buildNumber: release.buildVersion,
              source: 'FIREBASE'
            }
          }
        });

        // Send Email to Admins
        const { sendFirebaseReleaseEmail } = await import('../email');
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
        const adminEmails = admins.map(a => a.email);
        
        if (adminEmails.length > 0) {
          try {
            await sendFirebaseReleaseEmail(
              adminEmails,
              app.name,
              release.displayVersion,
              release.buildVersion,
              app.platform,
              app.bank,
              releaseNotes
            );
          } catch (emailError) {
            console.error(`[FirebaseSync] Error sending email for ${app.name}:`, emailError);
          }
        }
      }
    }

    console.log(`[FirebaseSync] Sync completed for ${app.name}.`);
  } catch (error) {
    console.error(`[FirebaseSync] Error syncing ${app.name}:`, error);
  }
}

export async function syncAllFirebaseApps() {
  const apps = await prisma.firebaseApp.findMany();
  for (const app of apps) {
    await syncFirebaseApp(app.id);
  }
}
