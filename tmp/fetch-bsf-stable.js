
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function fetchStableReleases() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const appdistro = google.firebaseappdistribution('v1');
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const parent = `projects/4555542864/apps/${appId}`;

  try {
    console.log(`Fetching stable releases for ${parent}...`);
    const res = await appdistro.projects.apps.releases.list({
      parent,
      auth,
      pageSize: 5,
    });

    if (res.data.releases) {
      res.data.releases.forEach(r => {
        console.log(`- STABLE Version: ${r.displayVersion} (${r.buildVersion})`);
      });
    } else {
      console.log('No releases found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchStableReleases();
