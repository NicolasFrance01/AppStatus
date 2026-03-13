import jwt from 'jsonwebtoken';
import { AppStatus } from '@prisma/client';

interface AppleKeyConfig {
  keyId: string;
  privateKey: string;
  issuerId: string;
}

function getDefaultConfig(): AppleKeyConfig {
  return {
    keyId: process.env.APPLE_KEY_ID!,
    privateKey: process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    issuerId: process.env.APPLE_ISSUER_ID!,
  };
}

function getBeeConfig(): AppleKeyConfig {
  return {
    keyId: process.env.APPLE_BEE_KEY_ID!,
    privateKey: process.env.APPLE_BEE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    issuerId: process.env.APPLE_ISSUER_ID!,
  };
}

function getBsfBiConfig(): AppleKeyConfig {
  return {
    keyId: process.env.APPLE_BSF_BI_KEY_ID!,
    privateKey: process.env.APPLE_BSF_BI_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    issuerId: process.env.APPLE_ISSUER_ID!,
  };
}

function getBsfBeeConfig(): AppleKeyConfig {
  return {
    keyId: process.env.APPLE_BSF_BEE_KEY_ID!,
    privateKey: process.env.APPLE_BSF_BEE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    issuerId: process.env.APPLE_ISSUER_ID!,
  };
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
  const configs: Array<{ label: string; config: AppleKeyConfig }> = [
    { label: 'BSJ Main', config: getDefaultConfig() },
  ];

  if (process.env.APPLE_BEE_KEY_ID) configs.push({ label: 'BSJ BEE', config: getBeeConfig() });
  if (process.env.APPLE_BSF_BI_KEY_ID) configs.push({ label: 'BSF BI', config: getBsfBiConfig() });
  if (process.env.APPLE_BSF_BEE_KEY_ID) configs.push({ label: 'BSF BEE', config: getBsfBeeConfig() });

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

  return {
    status: statusMap[appleState] || AppStatus.PENDING_REVIEW,
    version: latestVersion.attributes.versionString,
    build: 'N/A',
  };
}
