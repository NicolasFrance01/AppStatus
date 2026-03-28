
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

async function listApps() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) {
    console.error('GOOGLE_BSF_SERVICE_ACCOUNT_JSON not found');
    return;
  }

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
  });

  const firebase = google.firebase({
    version: 'v1beta1',
    auth,
  });

  try {
    const project = `projects/${credentials.project_id}`;
    console.log(`Listing apps for ${project}...`);
    
    const androidRes = await firebase.projects.androidApps.list({
      parent: project,
    });
    
    const iosRes = await firebase.projects.iosApps.list({
      parent: project,
    });

    const results = {
      android: androidRes.data.apps || [],
      ios: iosRes.data.apps || [],
    };
    
    fs.writeFileSync('tmp/bsf-apps.json', JSON.stringify(results, null, 2));
    console.log('Results written to tmp/bsf-apps.json');
  } catch (error) {
    console.error('Error listing apps:', error.message);
  }
}

listApps();
