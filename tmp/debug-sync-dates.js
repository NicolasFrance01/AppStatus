
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function debugSyncDates() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const fb = google.firebaseappdistribution({
    version: 'v1',
    auth,
  });

  const parent = 'projects/4555542864/apps/1:4555542864:android:29778052bea6fb28885c55';
  
  try {
    const res = await fb.projects.apps.releases.list({ parent, pageSize: 5 });
    const releases = res.data.releases || [];
    console.log(`Checking ${releases.length} releases...`);
    for (const r of releases) {
        console.log(`v${r.displayVersion}: createTime='${r.createTime}', type=${typeof r.createTime}`);
        if (!r.createTime) {
            console.log('WARNING: createTime is MISSING!');
        }
    }
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }
}

debugSyncDates();
