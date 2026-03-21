import { google } from 'googleapis';
import { AppStatus } from '@/generated/client';

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

// Maps Google Play track status to our internal AppStatus and detailed labels
function mapGoogleStatus(tracks: any[]): { status: AppStatus; storeStatus: string; updateStatus: string } {
  if (!tracks || tracks.length === 0) {
    return {
      status: AppStatus.PENDING_REVIEW,
      storeStatus: 'Unknown',
      updateStatus: 'No releases'
    };
  }

  const productionTrack = tracks.find((t: any) => t.track === 'production');
  const otherTracks = tracks.filter((t: any) => t.track !== 'production');

  const mainTrack = productionTrack || otherTracks[0];
  const trackName = mainTrack.track === 'production' ? 'Producción' : 
                   mainTrack.track === 'beta' ? 'Pruebas abiertas' :
                   mainTrack.track === 'alpha' ? 'Pruebas cerradas' : 'Pruebas internas';

  if (mainTrack?.releases?.length) {
    const release = mainTrack.releases[0];
    const status = release.status;

    let appStatus: AppStatus = AppStatus.PENDING_REVIEW;
    let updateLabel = status;

    if (status === 'completed') {
      appStatus = AppStatus.PUBLISHED;
      updateLabel = 'Publicado';
    } else if (status === 'inProgress') {
      appStatus = AppStatus.IN_REVIEW;
      const pct = release.userFraction ? ` (${Math.round(release.userFraction * 100)}%)` : '';
      updateLabel = `En revisión / Rollout${pct}`;
    } else if (status === 'halted') {
      appStatus = AppStatus.STORE_ISSUES;
      updateLabel = 'Detenido';
    } else if (status === 'draft') {
      appStatus = AppStatus.PENDING_REVIEW;
      updateLabel = 'Borrador / Pendiente de envío';
    }

    return {
      status: appStatus,
      storeStatus: trackName,
      updateStatus: updateLabel
    };
  }

  return {
    status: AppStatus.PENDING_REVIEW,
    storeStatus: trackName,
    updateStatus: 'Sin lanzamientos'
  };
}

async function getStoreVersion(packageName: string) {
  try {
    const r = await fetch(`https://play.google.com/store/apps/details?id=${packageName}&hl=es-419&gl=AR&nocache=${Date.now()}`);
    const html = await r.text();
    
    // Try JSON-LD first (more reliable)
    const ldMatch = html.match(/"softwareVersion"\s*:\s*"([\d\.]+)"/);
    if (ldMatch) return ldMatch[1];

    // Fallback to deeper metadata match
    const m = html.match(/\[\[\["([\d\.]+)"\]/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

export async function fetchGoogleAppStatus(packageName: string) {
  const accounts: Array<{ label: string; json: string }> = [];

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    accounts.push({ label: 'BSJ', json: process.env.GOOGLE_SERVICE_ACCOUNT_JSON });
  if (process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON)
    accounts.push({ label: 'BSF', json: process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON });
  if (process.env.GOOGLE_BER_SERVICE_ACCOUNT_JSON)
    accounts.push({ label: 'BER', json: process.env.GOOGLE_BER_SERVICE_ACCOUNT_JSON });
  if (process.env.GOOGLE_BSC_SERVICE_ACCOUNT_JSON)
    accounts.push({ label: 'BSC', json: process.env.GOOGLE_BSC_SERVICE_ACCOUNT_JSON });

  if (accounts.length === 0) throw new Error('No Google service account configured');

  let lastError: Error | null = null;

  for (const { label, json } of accounts) {
    try {
      console.log(`[Google] Trying ${label} account for ${packageName}...`);
      const { tracks } = await tryFetchWithAccount(packageName, json);

      const statusInfo = mapGoogleStatus(tracks);
      const productionTrack = tracks.find((t: any) => t.track === 'production');
      const mainRel = (productionTrack || tracks.find((t: any) => t.track === 'beta'))?.releases?.[0];
      const apiVersion = mainRel?.name ?? 'N/A';
      const build = mainRel?.versionCodes?.[0]?.toString() ?? 'N/A';

      let finalStatus = statusInfo.status;
      let finalUpdateLabel = statusInfo.updateStatus;

      // Managed Publishing Heuristic:
      // If Production API says completed but store version is different (older), 
      // it's "Ready to publish" or "In Review".
      // ONLY apply to Production to avoid confusing Beta updates.
      if (statusInfo.status === AppStatus.PUBLISHED && productionTrack) {
        const storeVersion = await getStoreVersion(packageName);
        if (storeVersion && storeVersion !== apiVersion) {
          // Since we can't differentiate "In Review" and "Approved" via API when Managed Publishing is ON,
          // we use PENDING_PUBLICATION as it's what the user expects for approved apps, 
          // but with a label that mentions both possibilities.
          finalStatus = AppStatus.PENDING_PUBLICATION; 
          finalUpdateLabel = 'En revisión / Listo para publicar';
          console.log(`[Google] Managed Publishing detected for ${packageName}: Store(${storeVersion}) vs API(${apiVersion})`);
        }
      }

      console.log(`[Google] Found "${packageName}" using ${label} account`);
      return {
        ...statusInfo,
        status: finalStatus,
        updateStatus: finalUpdateLabel,
        version: apiVersion,
        build,
      };
    } catch (err: any) {
      console.warn(`[Google] ${label} account failed for ${packageName}: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError ?? new Error(`App ${packageName} not found in any Google account`);
}
