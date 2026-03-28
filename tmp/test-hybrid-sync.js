
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function hybridSync() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const v1 = google.firebaseappdistribution('v1');
  const v1alpha = google.firebaseappdistribution('v1alpha');
  
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const parent = `projects/4555542864/apps/${appId}`;

  try {
    console.log(`Fetching releases via v1...`);
    const resV1 = await v1.projects.apps.releases.list({ parent, auth, pageSize: 5 });
    
    if (!resV1.data.releases) return;

    for (const r of resV1.data.releases) {
      console.log(`Fetching metrics for ${r.displayVersion} (${r.buildVersion})...`);
      
      // The release name is projects/{num}/apps/{id}/releases/{id}
      // v1 and v1alpha release names SHOULD be the same.
      try {
        const resAlpha = await v1alpha.projects.apps.releases.get({
          name: r.name,
          auth
        });
        const alpha = resAlpha.data;
        console.log(`- Metrics: Invited=${alpha.testerCount}, Accepted=${alpha.testerCount - alpha.openInvitationCount}, Downloaded=${alpha.testerWithInstallCount}`);
      } catch (alphaErr) {
        console.warn(`  Could not get v1alpha metrics for ${r.displayVersion}: ${alphaErr.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

hybridSync();
