
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testTesterStats() {
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
  const releaseId = '081ed666-6b2a-438e-a5c1-d9f6bb19ec28'; // 22.72.0

  // URL: https://firebaseappdistribution.googleapis.com/v1/projects/{projectNumber}/apps/{appId}/releases/{releaseId}/testerStats
  const url = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases/${releaseId}/testerStats`;
  
  console.log(`Trying /testerStats URL: ${url}`);
  try {
    const res = await client.request({ url });
    console.log('SUCCESS!');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.log(`FAILED: ${e.response ? e.response.status : e.message}`);
  }
}

testTesterStats();
