
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testTesterFilter() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const projectNumber = '4555542864';
  const appId = '1:4555542864:android:29778052bea6fb28885c55';

  // 1. List releases
  const listUrl = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases`;
  const listRes = await client.request({ url: listUrl });
  const releases = listRes.data.releases || [];
  if (releases.length === 0) return;

  const firstRelease = releases[0];
  const releaseName = firstRelease.name; // projects/.../apps/.../releases/...

  // 2. Try listing testers with a filter
  // Some APIs support filter=release="projects/..."
  const testersUrl = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/testers`;
  const filter = `release="${releaseName}"`;
  
  console.log(`Trying testers list with filter: ${filter}`);
  try {
    const res = await client.request({ 
        url: testersUrl,
        params: { filter }
    });
    console.log('SUCCESS!');
    console.log(`Found ${res.data.testers ? res.data.testers.length : 0} testers.`);
    if (res.data.testers && res.data.testers.length > 0) {
        console.log(JSON.stringify(res.data.testers[0], null, 2));
    }
  } catch (e) {
    console.log(`FAILED: ${e.response ? e.response.status : e.message}`);
    if (e.response && e.response.data) {
        console.log('Error data:', e.response.data);
    }
  }
}

testTesterFilter();
