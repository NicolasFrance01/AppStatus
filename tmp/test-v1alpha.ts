
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';

dotenv.config();

async function testV1Alpha() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) {
    console.error('GOOGLE_BSF_SERVICE_ACCOUNT_JSON not found in environment');
    return;
  }

  const credentials = JSON.parse(jsonStr);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const appdistro = google.firebaseappdistribution({
    version: 'v1',
    auth,
  });

  // Test with BSF Android App
  const appName = 'projects/312019777995/apps/1:312019777995:android:72f235889ff30342';
  
  try {
    console.log(`Fetching releases for ${appName} using v1...`);
    const res = await appdistro.projects.apps.releases.list({
      parent: appName,
      pageSize: 5,
    });

    const releases = res.data.releases || [];
    console.log(`Found ${releases.length} releases.`);

    for (const release of releases) {
      console.log('---');
      console.log(`Release: ${release.displayVersion} (${release.buildVersion})`);
      console.log(`ID: ${release.name}`);
      // Log all keys to see what's hidden
      console.log('Available keys:', Object.keys(release));
      
      const r = release as any;
      if (r.testerCount !== undefined) console.log(`Tester Count: ${r.testerCount}`);
      if (r.testerWithInstallCount !== undefined) console.log(`Tester with Install: ${r.testerWithInstallCount}`);
      if (r.openInvitationCount !== undefined) console.log(`Open Invitations: ${r.openInvitationCount}`);
    }
  } catch (error) {
    console.error('Error fetching releases:', error);
  }
}

testV1Alpha();
