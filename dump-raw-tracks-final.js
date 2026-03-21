const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[match[1]] = value.replace(/\\n/g, '\n');
    }
  });
}

async function getTracks(packageName, jsonString) {
  const credentials = JSON.parse(jsonString);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  const androidpublisher = google.androidpublisher({ version: 'v3', auth });
  const editInsert = await androidpublisher.edits.insert({ packageName });
  const editId = editInsert.data.id;
  try {
    const tracksRes = await androidpublisher.edits.tracks.list({ packageName, editId });
    return tracksRes.data.tracks;
  } finally {
    await androidpublisher.edits.delete({ packageName, editId }).catch(() => {});
  }
}

async function run() {
    loadEnv();
    const pkg = process.argv[2];
    const jsons = [
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_BER_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_BSC_SERVICE_ACCOUNT_JSON
    ].filter(Boolean);

    if (jsons.length === 0) { console.error("No JSON envs found after loading .env"); return; }
    for (const json of jsons) {
        try {
            const tracks = await getTracks(pkg, json);
            console.log(JSON.stringify(tracks, null, 2));
            return;
        } catch (e) { }
    }
    console.error("All JSONs failed or app not found");
}

run();
