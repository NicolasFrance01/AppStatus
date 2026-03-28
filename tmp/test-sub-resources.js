
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testReleaseSubResource() {
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
  const releaseName = firstRelease.name;

  // Try sub-resources
  const resources = ['testers', 'groups', 'stats', 'metrics'];
  
  for (const res of resources) {
    const url = `https://firebaseappdistribution.googleapis.com/v1/${releaseName}/${res}`;
    console.log(`Trying: ${url}`);
    try {
      const resp = await client.request({ url });
      console.log(`SUCCESS (${res})!`);
      console.log(JSON.stringify(resp.data, null, 2));
    } catch (e) {
      console.log(`FAILED (${res}): ${e.response ? e.response.status : e.message}`);
    }
  }
}

testReleaseSubResource();
