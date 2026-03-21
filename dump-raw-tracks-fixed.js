const { google } = require('googleapis');

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
    const pkg = process.argv[2];
    const jsons = [
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_BER_SERVICE_ACCOUNT_JSON,
        process.env.GOOGLE_BSC_SERVICE_ACCOUNT_JSON
    ].filter(Boolean);

    if (jsons.length === 0) { console.error("No JSON envs found"); return; }

    for (const json of jsons) {
        try {
            const tracks = await getTracks(pkg, json);
            console.log(JSON.stringify(tracks, null, 2));
            return;
        } catch (e) { 
            // console.warn(`Failed with one JSON: ${e.message}`);
        }
    }
    console.error("All JSONs failed");
}

run();
