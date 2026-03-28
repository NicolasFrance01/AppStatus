
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testV1AlphaAlternative() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const appId = '1:4555542864:android:29778052bea6fb28885c55';

  // Alternative v1alpha URL: https://firebaseappdistribution.googleapis.com/v1alpha/apps/{appId}/releases
  const url = `https://firebaseappdistribution.googleapis.com/v1alpha/apps/${appId}/releases`;
  
  console.log(`Trying v1alpha Alternative URL: ${url}`);
  try {
    const res = await client.request({ url });
    console.log('SUCCESS!');
    const releases = res.data.releases || [];
    console.log(`Found ${releases.length} releases.`);
    if (releases.length > 0) {
        console.log('Sample release metrics:');
        const r = releases[0];
        console.log(`- Version: ${r.displayVersion}`);
        console.log(`- Invited: ${r.testerCount}`);
        console.log(`- Accepted: ${r.testerCount - (r.openInvitationCount || 0)}`);
        console.log(`- Downloaded: ${r.testerWithInstallCount}`);
    }
  } catch (e) {
    console.log(`FAILED: ${e.response ? e.response.status : e.message}`);
    if (e.response && e.response.data) {
        console.log('Error details:', JSON.stringify(e.response.data, null, 2));
    }
  }
}

testV1AlphaAlternative();
