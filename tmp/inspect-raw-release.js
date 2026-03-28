
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function inspectReleaseDetails() {
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

  const url = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases/${releaseId}`;
  
  console.log(`Inspecting Release: ${url}`);
  try {
    const res = await client.request({ url });
    console.log('RAW RELEASE DATA:');
    console.log(JSON.stringify(res.data, null, 2));
    
    // Check v1alpha too if possible with GET
    try {
        const urlAlpha = `https://firebaseappdistribution.googleapis.com/v1alpha/projects/${projectNumber}/apps/${appId}/releases/${releaseId}`;
        console.log(`Trying v1alpha: ${urlAlpha}`);
        const resAlpha = await client.request({ url: urlAlpha });
        console.log('RAW v1alpha DATA:');
        console.log(JSON.stringify(resAlpha.data, null, 2));
    } catch (e) {
        console.log('v1alpha GET failed.');
    }

  } catch (e) {
    console.log(`FAILED: ${e.response ? e.response.status : e.message}`);
  }
}

inspectReleaseDetails();
