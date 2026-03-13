import { google } from 'googleapis';
import { AppStatus } from '@prisma/client';

function getAuthClient() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!rawJson) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON env variable');

  const credentials = JSON.parse(rawJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
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
  const auth = getAuthClient();
  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  // Create a temporary edit to read track info
  const editInsert = await androidpublisher.edits.insert({ packageName });
  const editId = editInsert.data.id!;

  try {
    // Get all tracks (production, beta, alpha, internal)
    const tracksRes = await androidpublisher.edits.tracks.list({ packageName, editId });
    const tracks = tracksRes.data.tracks ?? [];

    const status = mapGoogleStatus(tracks);

    // Get app details for version
    const detailsRes = await androidpublisher.edits.details.get({ packageName, editId });
    const versionCode = tracks
      .find((t: any) => t.track === 'production')
      ?.releases?.[0]?.versionCodes?.[0] ?? null;

    return {
      status,
      version: detailsRes.data.defaultLanguage ?? 'N/A',
      build: versionCode?.toString() ?? 'N/A',
    };
  } finally {
    // Always delete the edit (don't leave open drafts)
    await androidpublisher.edits.delete({ packageName, editId }).catch(() => {});
  }
}
