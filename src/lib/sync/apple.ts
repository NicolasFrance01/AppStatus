import jwt from 'jsonwebtoken';
import { AppStatus } from '@/generated/client';

interface AppleKeyConfig {
  keyId: string;
  privateKey: string;
  issuerId: string;
}

function formatPrivateKey(pk: string | undefined): string | undefined {
  if (!pk) return undefined;
  let key = pk.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\\n/g, '\n');
  
  const header = '-----BEGIN PRIVATE KEY-----';
  const footer = '-----END PRIVATE KEY-----';
  
  if (key.includes(header) && key.includes(footer)) {
    const startIdx = key.indexOf(header) + header.length;
    const endIdx = key.indexOf(footer);
    let body = key.substring(startIdx, endIdx);
    body = body.replace(/\\n/g, '').replace(/\s+/g, '');
    
    const lines = body.match(/.{1,64}/g) || [body];
    return `${header}\n${lines.join('\n')}\n${footer}`;
  }
  
  return key;
}

function getConfigs(): Array<{ label: string; config: AppleKeyConfig }> {
  const configs: Array<{ label: string; config: AppleKeyConfig }> = [];
  
  const add = (label: string, kid: string | undefined, pk: string | undefined, iss: string | undefined) => {
    const formattedKey = formatPrivateKey(pk);
    if (kid && formattedKey && iss) {
      configs.push({ label, config: { keyId: kid, privateKey: formattedKey, issuerId: iss } });
    }
  };

  add('BSJ Main', process.env.APPLE_KEY_ID, process.env.APPLE_PRIVATE_KEY, process.env.APPLE_ISSUER_ID);
  add('BSJ BEE', process.env.APPLE_BEE_KEY_ID, process.env.APPLE_BEE_PRIVATE_KEY, process.env.APPLE_ISSUER_ID);
  add('BSF BI', process.env.APPLE_BSF_BI_KEY_ID, process.env.APPLE_BSF_BI_PRIVATE_KEY, process.env.APPLE_BSF_ISSUER_ID);
  add('BSF BEE', process.env.APPLE_BSF_BEE_KEY_ID, process.env.APPLE_BSF_BEE_PRIVATE_KEY, process.env.APPLE_BSF_ISSUER_ID);
  add('BER BI', process.env.APPLE_BER_BI_KEY_ID, process.env.APPLE_BER_BI_PRIVATE_KEY, process.env.APPLE_BER_ISSUER_ID);
  add('BER BEE', process.env.APPLE_BER_BEE_KEY_ID, process.env.APPLE_BER_BEE_PRIVATE_KEY, process.env.APPLE_BER_ISSUER_ID);
  add('BSC BI', process.env.APPLE_BSC_BI_KEY_ID, process.env.APPLE_BSC_BI_PRIVATE_KEY, process.env.APPLE_BSC_ISSUER_ID);
  add('BSC BEE', process.env.APPLE_BSC_BEE_KEY_ID, process.env.APPLE_BSC_BEE_PRIVATE_KEY, process.env.APPLE_BSC_ISSUER_ID);

  return configs;
}

export function getAppleToken(config: AppleKeyConfig) {
  return jwt.sign(
    {
      iss: config.issuerId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 20 * 60,
      aud: 'appstoreconnect-v1',
    },
    config.privateKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: config.keyId,
        typ: 'JWT',
      },
    }
  );
}

const statusMap: Record<string, AppStatus> = {
  READY_FOR_SALE: AppStatus.PUBLISHED,
  WAITING_FOR_REVIEW: AppStatus.IN_REVIEW,
  PENDING_DEVELOPER_RELEASE: AppStatus.PENDING_PUBLICATION,
  REJECTED: AppStatus.REJECTED,
  METADATA_REJECTED: AppStatus.REJECTED,
  DEVELOPER_REJECTED: AppStatus.REJECTED,
  PREPARE_FOR_SUBMISSION: AppStatus.PENDING_REVIEW,
  INVALID_BINARY: AppStatus.STORE_ISSUES,
  PROCESSING_FOR_APP_STORE: AppStatus.PENDING_PUBLICATION,
  REMOVED_FROM_SALE: AppStatus.STORE_ISSUES,
  DEVELOPER_REMOVED_FROM_SALE: AppStatus.STORE_ISSUES,
};

async function fetchAppWithConfig(bundleId: string, config: AppleKeyConfig) {
  const token = getAppleToken(config);

  const appResponse = await fetch(`https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=${bundleId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const appData = await appResponse.json();
  return appData.data?.[0] ?? null;
}

async function fetchVersions(appId: string, token: string) {
  const versionResponse = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${appId}/appStoreVersions?limit=5`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const versionData = await versionResponse.json();
  return versionData.data ?? [];
}

export async function fetchAppleAppStatus(bundleId: string) {
  const configs = getConfigs();

  let foundApp = null;
  let usedConfig: AppleKeyConfig | null = null;

  for (const { label, config } of configs) {
    const app = await fetchAppWithConfig(bundleId, config);
    if (app) {
      console.log(`[Apple] Found "${bundleId}" using ${label} key`);
      foundApp = app;
      usedConfig = config;
      break;
    }
  }

  if (!foundApp || !usedConfig) {
    throw new Error(`App with bundleId ${bundleId} not found in any Apple account`);
  }

  const token = getAppleToken(usedConfig);
  const versions = await fetchVersions(foundApp.id, token);

  if (!versions.length) {
    return { 
      status: AppStatus.PENDING_REVIEW, 
      version: 'N/A', 
      build: 'N/A',
      storeStatus: 'Producción',
      updateStatus: 'Sin versiones'
    };
  }

  const updateStatusMap: Record<string, string> = {
    READY_FOR_SALE: 'Publicado',
    WAITING_FOR_REVIEW: 'En revisión',
    PENDING_DEVELOPER_RELEASE: 'Aprobada / Lista para publicar',
    REJECTED: 'Rechazada',
    METADATA_REJECTED: 'Rechazada (Metadatos)',
    DEVELOPER_REJECTED: 'Rechazada por desarrollador',
    PREPARE_FOR_SUBMISSION: 'Preparando envío',
    INVALID_BINARY: 'Binario inválido',
    PROCESSING_FOR_APP_STORE: 'Procesando para el Store',
    REMOVED_FROM_SALE: 'Retirado de venta',
    DEVELOPER_REMOVED_FROM_SALE: 'Retirado por desarrollador',
  };

  const liveV = versions.find((v: any) => v.attributes.appStoreState === 'READY_FOR_SALE');
  const latestV = versions[0];
  const rejectedV = versions.find((v: any) => 
    v.attributes.appStoreState === 'REJECTED' || 
    v.attributes.appStoreState === 'METADATA_REJECTED' || 
    v.attributes.appStoreState === 'DEVELOPER_REJECTED'
  );

  let selectedV = liveV || rejectedV || latestV;
  const status = statusMap[selectedV.attributes.appStoreState] || AppStatus.PENDING_REVIEW;
  let updateLabel = updateStatusMap[selectedV.attributes.appStoreState] || 'Publicado';

  // Dual Status Logic: If we are live but have a pending update, prepare specific label
  if (liveV && latestV.id !== liveV.id) {
    const pendingState = latestV.attributes.appStoreState;
    const pendingLabel = updateStatusMap[pendingState] || pendingState;
    updateLabel = `UPDATE:${latestV.attributes.versionString}|${pendingLabel}`;
  } else if (liveV && rejectedV) {
    // If live but also have a rejection, show rejection info
    const rejectedLabel = updateStatusMap[rejectedV.attributes.appStoreState] || 'Rechazada';
    updateLabel = `UPDATE:${rejectedV.attributes.versionString}|${rejectedLabel}`;
  }

  return {
    status,
    storeStatus: 'Producción',
    updateStatus: updateLabel,
    version: selectedV.attributes.versionString,
    build: 'N/A',
  };
}
