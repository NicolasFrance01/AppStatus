
const { google } = require('googleapis');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const log = [];
function logMsg(msg) {
  console.log(msg);
  log.push(msg);
}

async function testVariations() {
  const jsonStr = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) return;

  const credentials = JSON.parse(jsonStr.replace(/^'|'$/g, ''));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const projectNumber = '4555542864';
  const projectId = 'banco-santa-fe';
  const appId = '1:4555542864:android:29778052bea6fb28885c55';

  const urls = [
    `https://firebaseappdistribution.googleapis.com/v1alpha/projects/${projectNumber}/apps/${appId}/releases`,
    `https://firebaseappdistribution.googleapis.com/v1alpha/projects/${projectId}/apps/${appId}/releases`,
    `https://firebaseappdistribution.googleapis.com/v1alpha/apps/${appId}/releases`,
    `https://firebaseappdistribution.googleapis.com/v1/projects/${projectNumber}/apps/${appId}/releases?view=FULL`,
    `https://firebaseappdistribution.googleapis.com/v1/projects/${projectId}/apps/${appId}/releases?view=FULL`,
  ];

  for (const url of urls) {
    logMsg(`\nTesting URL: ${url}`);
    try {
      const res = await client.request({ url });
      logMsg('SUCCESS!');
      const releases = res.data.releases || [];
      if (releases.length > 0) {
        const r = releases[0];
        logMsg(`First Release: ${r.displayVersion} (${r.buildVersion})`);
        logMsg(`Metrics: testerCount=${r.testerCount}, openInvitationCount=${r.openInvitationCount}, testerWithInstallCount=${r.testerWithInstallCount}`);
      } else {
        logMsg('Empty releases list.');
      }
    } catch (error) {
      logMsg(`FAILED: ${error.response ? error.response.status : error.message}`);
      if (error.response && error.response.data) {
        logMsg(`Error Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
    }
  }
  fs.writeFileSync('tmp/variation-results.txt', log.join('\n'));
}

testVariations();
