
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function compareAPIs() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const v1 = google.firebaseappdistribution('v1');
  const v1alpha = google.firebaseappdistribution('v1alpha');
  
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const parent = `projects/4555542864/apps/${appId}`;

  try {
    console.log(`--- V1 Results ---`);
    const resV1 = await v1.projects.apps.releases.list({ parent, auth, pageSize: 3 });
    resV1.data.releases?.forEach(r => console.log(`V1: ${r.displayVersion} (${r.buildVersion})`));

    console.log(`--- V1ALPHA Results ---`);
    // Using direct request because list is missing from types/protos sometimes
    const client = await auth.getClient();
    const url = `https://firebaseappdistribution.googleapis.com/v1alpha/${parent}/releases?pageSize=3`;
    const resAlpha = await client.request({ url });
    
    resAlpha.data.releases?.forEach(r => {
      console.log(`ALPHA: ${r.displayVersion} (${r.buildVersion}) | Invited: ${r.testerCount}, Downloaded: ${r.testerWithInstallCount}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
  }
}

compareAPIs();
