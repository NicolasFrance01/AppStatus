
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

async function testGroupCounts() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const projectNumber = '4555542864';

  // List groups
  const groupsUrl = `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/groups`;
  console.log(`Fetching groups from: ${groupsUrl}`);
  
  try {
    const res = await client.request({ url: groupsUrl });
    const groups = res.data.groups || [];
    console.log(`Found ${groups.length} groups.`);
    
    let totalTesters = 0;
    groups.forEach(g => {
        console.log(`- ${g.displayName}: ${g.testerCount} testers (${g.name})`);
        totalTesters += g.testerCount || 0;
    });
    console.log(`Total Testers in Groups: ${totalTesters}`);
  } catch (e) {
    console.log(`FAILED: ${e.response ? e.response.status : e.message}`);
  }
}

testGroupCounts();
