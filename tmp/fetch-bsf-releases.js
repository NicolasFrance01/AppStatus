
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function fetchReleases() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const appdistribution = google.firebaseappdistribution('v1alpha');
  const appId = '1:4555542864:android:29778052bea6fb28885c55'; // BSF Banca Empresas Android
  const parent = `projects/4555542864/apps/${appId}`;

  try {
    console.log(`Fetching releases for ${parent}...`);
    const res = await appdistribution.projects.apps.releases.list({
      parent,
      auth,
      pageSize: 20,
    });

    fs.writeFileSync('tmp/bsf-releases.json', JSON.stringify(res.data.releases, null, 2));
    console.log(`Found ${res.data.releases?.length || 0} releases. Saved to tmp/bsf-releases.json`);
    
    if (res.data.releases) {
      res.data.releases.slice(0, 5).forEach(r => {
        console.log(`- Version: ${r.displayVersion} (${r.buildVersion}), Metrics: Invited=${r.testerCount || 0}, Downloaded=${r.testerWithInstallCount || 0}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchReleases();
