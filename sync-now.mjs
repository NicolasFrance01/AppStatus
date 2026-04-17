// Force sync all apps with real API data
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const prisma = new PrismaClient();

// ─── Apple helpers ───────────────────────────────────────────────────────────
const BSJ_ISSUER = process.env.APPLE_ISSUER_ID;
const BSF_ISSUER = process.env.APPLE_BSF_ISSUER_ID;
const BER_ISSUER = process.env.APPLE_BER_ISSUER_ID;
const BSC_ISSUER = process.env.APPLE_BSC_ISSUER_ID;

const appleKeys = [
  { label: 'BSJ Main', keyId: process.env.APPLE_KEY_ID,         pk: process.env.APPLE_PRIVATE_KEY,         issuerId: BSJ_ISSUER },
  { label: 'BSJ BEE',  keyId: process.env.APPLE_BEE_KEY_ID,     pk: process.env.APPLE_BEE_PRIVATE_KEY,     issuerId: BSJ_ISSUER },
  { label: 'BSF BI',   keyId: process.env.APPLE_BSF_BI_KEY_ID,  pk: process.env.APPLE_BSF_BI_PRIVATE_KEY,  issuerId: BSF_ISSUER },
  { label: 'BSF BEE',  keyId: process.env.APPLE_BSF_BEE_KEY_ID, pk: process.env.APPLE_BSF_BEE_PRIVATE_KEY, issuerId: BSF_ISSUER },
  { label: 'BER BI',   keyId: process.env.APPLE_BER_BI_KEY_ID,  pk: process.env.APPLE_BER_BI_PRIVATE_KEY,  issuerId: BER_ISSUER },
  { label: 'BER BEE',  keyId: process.env.APPLE_BER_BEE_KEY_ID, pk: process.env.APPLE_BER_BEE_PRIVATE_KEY, issuerId: BER_ISSUER },
  { label: 'BSC BI',   keyId: process.env.APPLE_BSC_BI_KEY_ID,  pk: process.env.APPLE_BSC_BI_PRIVATE_KEY,  issuerId: BSC_ISSUER },
  { label: 'BSC BEE',  keyId: process.env.APPLE_BSC_BEE_KEY_ID, pk: process.env.APPLE_BSC_BEE_PRIVATE_KEY, issuerId: BSC_ISSUER },
].filter(k => k.keyId && k.pk && k.issuerId && k.issuerId !== 'TODO_BER_ISSUER_ID');

function makeToken(keyId, pk, issuerId) {
  return jwt.sign(
    { iss: issuerId, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+1200, aud: 'appstoreconnect-v1' },
    pk.replace(/\\n/g,'\n'),
    { algorithm: 'ES256', header: { alg: 'ES256', kid: keyId, typ: 'JWT' } }
  );
}

const stateMap = {
  READY_FOR_SALE: 'PUBLISHED', WAITING_FOR_REVIEW: 'IN_REVIEW',
  PENDING_DEVELOPER_RELEASE: 'PENDING_PUBLICATION', REJECTED: 'REJECTED',
  METADATA_REJECTED: 'REJECTED', PREPARE_FOR_SUBMISSION: 'PENDING_REVIEW',
  INVALID_BINARY: 'STORE_ISSUES', PROCESSING_FOR_APP_STORE: 'PENDING_PUBLICATION',
};

const appleUpdateStatusMap = {
  READY_FOR_SALE: 'Publicado',
  WAITING_FOR_REVIEW: 'Pendiente de revisión',
  PENDING_DEVELOPER_RELEASE: 'Pendiente de publicación',
  REJECTED: 'Rechazado',
  METADATA_REJECTED: 'Rechazado (Metadatos)',
  PREPARE_FOR_SUBMISSION: 'Preparando para envío',
  INVALID_BINARY: 'Binario inválido',
  PROCESSING_FOR_APP_STORE: 'Procesando',
};

async function syncApple(bundleId) {
  for (const { label, keyId, pk, issuerId } of appleKeys) {
    try {
      const token = makeToken(keyId, pk, issuerId);
      const r = await fetch(`https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=${bundleId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      const app = data.data?.[0];
      if (!app) continue;

      // Fetch more versions to see both live and pending
      const vr = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${app.id}/appStoreVersions?limit=5`, { headers: { Authorization: `Bearer ${token}` } });
      const vData = await vr.json();
      const versions = vData.data ?? [];
      if (!versions.length) return { status: 'PENDING_REVIEW', version: 'N/A', build: 'N/A' };

      // Priority logic:
      // 1. If any version is REJECTED or METADATA_REJECTED, that's crucial.
      // 2. If there is a READY_FOR_SALE (Live) version, the app is PUBLISHED, but maybe with a pending update.
      // 3. Otherwise, pick the latest created version.
      
      const rejectedV = versions.find(v => v.attributes.appStoreState === 'REJECTED' || v.attributes.appStoreState === 'METADATA_REJECTED');
      const liveV = versions.find(v => v.attributes.appStoreState === 'READY_FOR_SALE');
      const latestV = versions[0]; // Usually the newest one

      let selectedV = rejectedV || liveV || latestV;
      
      // Special case: if we are live but have a pending release or review, we might want to mention it.
      // For now, if live, we say PUBLISHED.
      if (liveV && selectedV.attributes.appStoreState !== 'REJECTED') {
        selectedV = liveV;
      }

      const appleState = selectedV.attributes.appStoreState;
      const result = {
        status: stateMap[appleState] || 'PENDING_REVIEW',
        storeStatus: 'Producción',
        updateStatus: appleUpdateStatusMap[appleState] || appleState,
        version: selectedV.attributes.versionString,
        build: 'N/A',
      };

      // Add hint if there's a newer version pending
      if (liveV && latestV.id !== liveV.id) {
        result.updateStatus += ` (Update: ${latestV.attributes.versionString} ${latestV.attributes.appStoreState})`;
      }

      console.log(`  🍎 ${label}: ${bundleId} → ${result.status} v${result.version} (${appleState})`);
      return result;
    } catch (e) { 
      console.error(`  🍎 Error ${label} for ${bundleId}:`, e.message);
    }
  }
  return null;
}

// ─── Google helpers ───────────────────────────────────────────────────────────
const googleAccounts = [
  { label: 'BSJ', json: process.env.GOOGLE_SERVICE_ACCOUNT_JSON },
  { label: 'BSF', json: process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON },
  { label: 'BER', json: process.env.GOOGLE_BER_SERVICE_ACCOUNT_JSON },
  { label: 'BSC', json: process.env.GOOGLE_BSC_SERVICE_ACCOUNT_JSON },
].filter(a => a.json);

function mapGoogleStatus(tracks) {
  if (!tracks?.length) return { status: 'PENDING_REVIEW', storeStatus: 'Unknown', updateStatus: 'No releases' };
  
  const productionTrack = tracks.find(t => t.track === 'production');
  const otherTracks = tracks.filter(t => t.track !== 'production');
  const mainTrack = productionTrack || otherTracks[0];
  
  const trackName = mainTrack.track === 'production' ? 'Producción' : 
                   mainTrack.track === 'beta' ? 'Pruebas abiertas' :
                   mainTrack.track === 'alpha' ? 'Pruebas cerradas' : 'Pruebas internas';

  if (mainTrack?.releases?.length) {
    const s = mainTrack.releases[0].status;
    let appStatus = 'PENDING_REVIEW';
    let updateLabel = s;

    if (s === 'completed') { appStatus = 'PUBLISHED'; updateLabel = 'Publicado'; }
    else if (s === 'inProgress') { appStatus = 'IN_REVIEW'; updateLabel = 'En revisión / Rollout'; }
    else if (s === 'halted') { appStatus = 'STORE_ISSUES'; updateLabel = 'Detenido'; }
    else if (s === 'draft') { appStatus = 'PENDING_PUBLICATION'; updateLabel = 'Lista para publicarse'; }

    return { status: appStatus, storeStatus: trackName, updateStatus: updateLabel };
  }
  return { status: 'PENDING_REVIEW', storeStatus: trackName, updateStatus: 'Sin lanzamientos' };
}

async function getStoreVersion(packageName) {
  try {
    const r = await fetch(`https://play.google.com/store/apps/details?id=${packageName}&hl=es-419`);
    const html = await r.text();
    const m = html.match(/\[\[\["([\d\.]+)"\]/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

async function syncGoogle(packageName) {
  for (const { label, json } of googleAccounts) {
    try {
      const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(json), scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
      const ap = google.androidpublisher({ version: 'v3', auth });
      const edit = await ap.edits.insert({ packageName });
      const editId = edit.data.id;
      try {
        const tr = await ap.edits.tracks.list({ packageName, editId });
        const tracks = tr.data.tracks ?? [];
        const statusInfo = mapGoogleStatus(tracks);
        const mainRel = tracks.find(t => t.track==='production' || t.track==='beta')?.releases?.[0];
        const build = mainRel?.versionCodes?.[0] ?? 'N/A';
        const apiVersion = mainRel?.name ?? 'N/A';
        
        let finalStatus = statusInfo.status;
        let finalUpdateLabel = statusInfo.updateStatus;

        // Managed Publishing Heuristic:
        // If API says completed but store version is different (older), it's "Ready to publish"
        if (statusInfo.status === 'PUBLISHED') {
          const storeVersion = await getStoreVersion(packageName);
          if (storeVersion && storeVersion !== apiVersion) {
            finalStatus = 'PENDING_PUBLICATION';
            finalUpdateLabel = 'Lista para publicarse';
            console.log(`  🔍 Managed Publishing detected for ${packageName}: Store(${storeVersion}) vs API(${apiVersion})`);
          }
        }

        console.log(`  🤖 ${label}: ${packageName} → ${finalStatus} v${apiVersion} (${build})`);
        return { ...statusInfo, status: finalStatus, updateStatus: finalUpdateLabel, version: apiVersion, build: String(build) };
      } finally {
        await ap.edits.delete({ packageName, editId }).catch(()=>{});
      }
    } catch (e) { /* try next */ }
  }
  return null;
}

// ─── Main sync ────────────────────────────────────────────────────────────────
const apps = await prisma.app.findMany();
console.log(`\nSyncing ${apps.length} apps...\n`);

function getEntity(bundleId) {
  const bid = bundleId.toLowerCase();
  if (bid.includes('bancosanjuan') || bid.includes('empresasbsj')) return 'Banco San Juan';
  if (bid.includes('bancosantafe') || bid.includes('empresasbsf')) return 'Banco Santa Fe';
  if (bid.includes('bancoentrerios') || bid.includes('empresasber') || bid.includes('bancobersa') || bid.includes('empresasbersa')) return 'Banco Entre Ríos';
  if (bid.includes('bancosantacruz') || bid.includes('empresasbsc')) return 'Banco Santa Cruz';
  return 'Unknown';
}

for (const app of apps) {
  console.log(`📦 ${app.name} (${app.platform} — ${app.bundleId})`);
  let result = null;
  const entity = getEntity(app.bundleId);

  if (app.platform === 'IOS') result = await syncApple(app.bundleId);
  else result = await syncGoogle(app.bundleId);

  if (result) {
    await prisma.app.update({
      where: { id: app.id },
      data: { 
        status: result.status, 
        currentVersion: result.version, 
        buildNumber: result.build, 
        lastUpdate: new Date(),
        entity: entity,
        storeStatus: result.storeStatus,
        updateStatus: result.updateStatus
      }
    });
    console.log(`  ✅ Updated: ${result.status} | Bank: ${entity} | AppState: ${result.storeStatus} | Update: ${result.updateStatus}\n`);
  } else {
    // If we didn't get results but we know the entity, let's at least update that
    await prisma.app.update({
      where: { id: app.id },
      data: { entity: entity }
    });
    console.log(`  ⚠️  Skipped — not found in any account (Bank updated to ${entity})\n`);
  }
}

await prisma.$disconnect();
console.log('✅ Sync complete!');
