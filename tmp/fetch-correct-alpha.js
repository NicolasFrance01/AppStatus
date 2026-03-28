
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function fetchCorrectAlpha() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  // Using the mobilesdkAppId directly in the path as seen in v1alpha.js
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const url = `https://firebaseappdistribution.googleapis.com/v1alpha/apps/${appId}/releases`;

  try {
    console.log(`Fetching from URL: ${url}`);
    const res = await client.request({ url });
    console.log('Success!');
    const releases = res.data.releases || [];
    releases.slice(0, 3).forEach(r => {
      console.log(`- Version: ${r.displayVersion} (${r.buildVersion}) | Invited: ${r.testerCount}`);
    });
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

fetchCorrectAlpha();
