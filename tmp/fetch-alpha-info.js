
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function fetchAlphaInfo() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const url = `https://firebaseappdistribution.googleapis.com/v1alpha/apps/${appId}`;

  try {
    console.log(`Fetching from URL: ${url}`);
    const res = await client.request({ url });
    fs.writeFileSync('tmp/app-info-alpha.json', JSON.stringify(res.data, null, 2));
    console.log('Success! Saved to tmp/app-info-alpha.json');
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

fetchAlphaInfo();
