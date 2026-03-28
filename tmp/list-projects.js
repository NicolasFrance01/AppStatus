
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function listProjects() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) {
    console.error('GOOGLE_BSF_SERVICE_ACCOUNT_JSON not found');
    return;
  }

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const crm = google.cloudresourcemanager({
    version: 'v1',
    auth,
  });

  try {
    console.log('Listing accessible projects...');
    const res = await crm.projects.list();
    console.log('Projects:', JSON.stringify(res.data.projects, null, 2));
  } catch (error) {
    console.error('Error listing projects:', error.message);
  }
}

listProjects();
