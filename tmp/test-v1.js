
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testV1() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) {
    console.error('GOOGLE_BSF_SERVICE_ACCOUNT_JSON not found in environment');
    return;
  }

  const credentials = JSON.parse(jsonStr);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const appdistro = google.firebaseappdistribution({
    version: 'v1',
    auth,
  });

  const project = `projects/${credentials.project_id}`;
  
  try {
    console.log(`Fetching testers for ${project} using v1...`);
    const res = await appdistro.projects.testers.list({
      parent: project,
      pageSize: 5,
    });

    const testers = res.data.testers || [];
    console.log(`Found ${testers.length} testers.`);
    for (const tester of testers) {
      console.log(`- ${tester.displayName} (${tester.name})`);
    }
  } catch (error) {
    console.error('Error fetching testers:', JSON.stringify(error, null, 2));
  }
}

testV1();
