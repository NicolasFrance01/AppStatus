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
    const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
    if (!json) { console.error("No JSON env"); return; }
    try {
        const tracks = await getTracks(pkg, json);
        console.log(JSON.stringify(tracks, null, 2));
    } catch (e) { console.error(e); }
}

run();
