import { google } from 'googleapis';
import { AppStatus } from '@prisma/client';

function getAuthClient(jsonString: string) {
  const credentials = JSON.parse(jsonString);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
}

async function tryFetchWithAccount(packageName: string, jsonString: string) {
  const auth = getAuthClient(jsonString);
  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  const editInsert = await androidpublisher.edits.insert({ packageName });
  const editId = editInsert.data.id!;

  try {
    const tracksRes = await androidpublisher.edits.tracks.list({ packageName, editId });
    const tracks = tracksRes.data.tracks ?? [];
    const detailsRes = await androidpublisher.edits.details.get({ packageName, editId });

    return { tracks, details: detailsRes.data };
  } finally {
    await androidpublisher.edits.delete({ packageName, editId }).catch(() => {});
  }
}

// Maps Google Play track status to our internal AppStatus
function mapGoogleStatus(tracks: any[]): AppStatus {
  if (!tracks || tracks.length === 0) return AppStatus.PENDING_REVIEW;

  // Check production track first, then others
  const ordered = ['production', 'beta', 'alpha', 'internal'];
  for (const trackName of ordered) {
    const track = tracks.find((t: any) => t.track === trackName);
    if (!track?.releases?.length) continue;

    const release = track.releases[0];
    const status = release.status;

    if (status === 'completed') return AppStatus.PUBLISHED;
    if (status === 'inProgress') return AppStatus.IN_REVIEW;
    if (status === 'halted') return AppStatus.STORE_ISSUES;
    if (status === 'draft') return AppStatus.PENDING_PUBLICATION;
  }

  return AppStatus.PENDING_REVIEW;
}

export async function fetchGoogleAppStatus(packageName: string) {
  const accounts: Array<{ label: string; json: string }> = [];

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    accounts.push({ label: 'BSJ', json: process.env.GOOGLE_SERVICE_ACCOUNT_JSON });
  if (process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON)
    accounts.push({ label: 'BSF', json: process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON });

  if (accounts.length === 0) throw new Error('No Google service account configured');

  let lastError: Error | null = null;

  for (const { label, json } of accounts) {
    try {
      console.log(`[Google] Trying ${label} account for ${packageName}...`);
      const { tracks } = await tryFetchWithAccount(packageName, json);

      const status = mapGoogleStatus(tracks);
      const versionCode = tracks
        .find((t: any) => t.track === 'production')
        ?.releases?.[0]?.versionCodes?.[0] ?? null;

      console.log(`[Google] Found "${packageName}" using ${label} account`);
      return {
        status,
        version: 'N/A',
        build: versionCode?.toString() ?? 'N/A',
      };
    } catch (err: any) {
      console.warn(`[Google] ${label} account failed for ${packageName}: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError ?? new Error(`App ${packageName} not found in any Google account`);
}
