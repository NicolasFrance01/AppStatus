
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function fetchDiscovery() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const url = 'https://firebaseappdistribution.googleapis.com/$discovery/rest?version=v1alpha';

  try {
    console.log(`Fetching discovery doc from: ${url}`);
    const res = await client.request({ url });
    fs.writeFileSync('tmp/discovery-alpha.json', JSON.stringify(res.data, null, 2));
    console.log('Success! Saved to tmp/discovery-alpha.json');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchDiscovery();
