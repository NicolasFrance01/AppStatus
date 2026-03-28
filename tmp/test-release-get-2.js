
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testReleaseGetVariation() {
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

  // 1. List releases to get a valid ID (from projects/.../apps/.../releases/...)
  const listUrl = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases`;
  const listRes = await client.request({ url: listUrl });
  const releases = listRes.data.releases || [];
  
  if (releases.length === 0) return;

  const firstRelease = releases[0];
  const parts = firstRelease.name.split('/');
  const releaseId = parts[parts.length - 1];
  
  console.log(`Release ID: ${releaseId} for ${firstRelease.displayVersion}`);

  // Variation: apps/{appId}/releases/{releaseId}
  const url = `https://firebaseappdistribution.googleapis.com/v1alpha/apps/${appId}/releases/${releaseId}`;
  console.log(`Trying: ${url}`);
  
  try {
    const res = await client.request({ url });
    console.log('SUCCESS!');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.log(`FAILED: ${error.response ? error.response.status : error.message}`);
  }
}

testReleaseGetVariation();
