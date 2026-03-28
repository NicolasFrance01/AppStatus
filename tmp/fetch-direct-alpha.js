
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function fetchDirect() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const url = `https://firebaseappdistribution.googleapis.com/v1alpha/projects/4555542864/apps/${appId}/releases?pageSize=5`;

  try {
    console.log(`Fetching from URL: ${url}`);
    const res = await client.request({ url });
    console.log('Success!');
    const releases = res.data.releases || [];
    releases.forEach(r => {
      console.log(`- Version: ${r.displayVersion} (${r.buildVersion}) | Invited: ${r.testerCount}`);
    });
    fs.writeFileSync('tmp/direct-alpha.json', JSON.stringify(res.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

fetchDirect();
