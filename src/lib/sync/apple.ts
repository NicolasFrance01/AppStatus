import jwt from 'jsonwebtoken';
import { AppStatus } from '@/generated/client';

interface AppleKeyConfig {
  keyId: string;
  privateKey: string;
  issuerId: string;
}

function getConfigs(): Array<{ label: string; config: AppleKeyConfig }> {
  const configs: Array<{ label: string; config: AppleKeyConfig }> = [];
  
  const add = (label: string, kid: string | undefined, pk: string | undefined, iss: string | undefined) => {
    if (kid && pk && iss) {
      let key = pk.trim();
      // Remove surrounding quotes if accidentally included
      if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1).trim();
      }
      
      // Replace literal '\n' with actual newlines
      key = key.replace(/\\n/g, '\n');

      // If there are still no actual newlines but it has header/footer (spaces instead of newlines)
      if (!key.includes('\n')) {
        const header = '-----BEGIN PRIVATE KEY-----';
        const footer = '-----END PRIVATE KEY-----';
        if (key.includes(header) && key.includes(footer)) {
          let body = key.replace(header, '').replace(footer, '').replace(/\s+/g, '');
          const lines = body.match(/.{1,64}/g) || [body];
          key = `${header}\n${lines.join('\n')}\n${footer}`;
        }
      }

      configs.push({ label, config: { keyId: kid, privateKey: key, issuerId: iss } });
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
  PREPARE_FOR_SUBMISSION: AppStatus.PENDING_REVIEW,
  INVALID_BINARY: AppStatus.STORE_ISSUES,
  PROCESSING_FOR_APP_STORE: AppStatus.PENDING_PUBLICATION,
};

async function fetchAppWithConfig(bundleId: string, config: AppleKeyConfig) {
  const token = getAppleToken(config);

  const appResponse = await fetch(`https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=${bundleId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const appData = await appResponse.json();
  return appData.data?.[0] ?? null;
}

async function fetchVersionStatus(appId: string, token: string) {
  const versionResponse = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${appId}/appStoreVersions?limit=1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const versionData = await versionResponse.json();
  return versionData.data?.[0] ?? null;
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
  const latestVersion = await fetchVersionStatus(foundApp.id, token);

  if (!latestVersion) {
    return { status: AppStatus.PENDING_REVIEW, version: 'N/A', build: 'N/A' };
  }

  const appleState = latestVersion.attributes.appStoreState;
  const status = statusMap[appleState] || AppStatus.PENDING_REVIEW;

  const storeStatus = 'Producción'; // Standard for App Store
  const updateStatusMap: Record<string, string> = {
    READY_FOR_SALE: 'Publicado',
    WAITING_FOR_REVIEW: 'Pendiente de revisión',
    PENDING_DEVELOPER_RELEASE: 'Pendiente de publicación',
    REJECTED: 'Rechazado',
    METADATA_REJECTED: 'Rechazado (Metadatos)',
    PREPARE_FOR_SUBMISSION: 'Preparando para envío',
    INVALID_BINARY: 'Binario inválido',
    PROCESSING_FOR_APP_STORE: 'Procesando',
  };

  return {
    status,
    storeStatus,
    updateStatus: updateStatusMap[appleState] || appleState,
    version: latestVersion.attributes.versionString,
    build: 'N/A',
  };
}
