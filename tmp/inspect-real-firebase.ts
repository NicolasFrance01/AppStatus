import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

const appdistribution = google.firebaseappdistribution('v1');

async function inspect() {
  const bank = 'Santa Fe';
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) {
    console.error("GOOGLE_BSF_SERVICE_ACCOUNT_JSON not found in .env");
    return;
  }

  const credentials = JSON.parse(jsonStr);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  
  const authClient = await auth.getClient();
  
  // Use BSF Banca Empresa Android as test
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  const projectNumber = '4555542864';
  const parent = `projects/${projectNumber}/apps/${appId}`;

  console.log(`Inspecting parent: ${parent}`);

  try {
    const response = await appdistribution.projects.apps.releases.list({
      parent,
      auth: authClient as any,
      pageSize: 1,
    });

    const releases = response.data.releases || [];
    if (releases.length === 0) {
      console.log("No releases found.");
    } else {
      console.log("Full Release Object Schema:");
      console.log(JSON.stringify(releases[0], null, 2));
    }
  } catch (error: any) {
    console.error("Error inspecting:", error.response?.data || error.message);
  }
}

inspect();
