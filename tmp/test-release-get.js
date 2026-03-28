
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testReleaseGet() {
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

  // 1. List releases to get a valid ID
  const listUrl = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases`;
  console.log(`Listing releases from: ${listUrl}`);
  const listRes = await client.request({ url: listUrl });
  const releases = listRes.data.releases || [];
  
  if (releases.length === 0) {
    console.log('No releases found.');
    return;
  }

  const firstRelease = releases[0];
  const releaseName = firstRelease.name; // projects/.../apps/.../releases/...
  console.log(`\nFound Release: ${firstRelease.displayVersion} (${firstRelease.buildVersion})`);
  console.log(`Full Name: ${releaseName}`);

  // 2. Try GET with v1alpha
  const alphaGetUrl = `https://firebaseappdistribution.googleapis.com/v1alpha/${releaseName}`;
  console.log(`\nTrying v1alpha GET: ${alphaGetUrl}`);
  try {
    const alphaRes = await client.request({ url: alphaGetUrl });
    console.log('SUCCESS (v1alpha GET)!');
    console.log('Data:', JSON.stringify(alphaRes.data, null, 2));
  } catch (error) {
    console.log(`FAILED (v1alpha GET): ${error.response ? error.response.status : error.message}`);
    if (error.response && error.response.data) {
        console.log('Error data:', error.response.data);
    }
  }

  // 3. Try GET with v1 and view=FULL
  const v1GetUrl = `https://firebaseappdistribution.googleapis.com/v1/${releaseName}?view=FULL`;
  console.log(`\nTrying v1 GET with view=FULL: ${v1GetUrl}`);
  try {
    const v1Res = await client.request({ url: v1GetUrl });
    console.log('SUCCESS (v1 GET FULL)!');
    console.log('Data metrics:', {
        testerCount: v1Res.data.testerCount,
        openInvitationCount: v1Res.data.openInvitationCount,
        testerWithInstallCount: v1Res.data.testerWithInstallCount
    });
  } catch (error) {
    console.log(`FAILED (v1 GET FULL): ${error.message}`);
  }
}

testReleaseGet();
