import jwt from 'jsonwebtoken';
import { AppStatus } from '@prisma/client';

export async function getAppleToken() {
  const issuerId = process.env.APPLE_ISSUER_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!issuerId || !keyId || !privateKey) {
    throw new Error('Missing Apple API credentials');
  }

  return jwt.sign(
    {
      iss: issuerId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 20 * 60,
      aud: 'appstoreconnect-v1',
    },
    privateKey,
    {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
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

export async function fetchAppleAppStatus(bundleId: string) {
  const token = await getAppleToken();

  // 1. Get app by bundleId
  const appResponse = await fetch(`https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=${bundleId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const appData = await appResponse.json();
  const app = appData.data?.[0];

  if (!app) {
    throw new Error(`App with bundleId ${bundleId} not found in App Store Connect`);
  }

  // 2. Get the latest version status
  const versionResponse = await fetch(`https://api.appstoreconnect.apple.com/v1/apps/${app.id}/appStoreVersions?limit=1`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const versionData = await versionResponse.json();
  const latestVersion = versionData.data?.[0];

  if (!latestVersion) {
    return {
      status: AppStatus.PENDING_REVIEW,
      version: "N/A",
      build: "N/A"
    };
  }

  const appleState = latestVersion.attributes.appStoreState;
  
  return {
    status: statusMap[appleState] || AppStatus.PENDING_REVIEW,
    version: latestVersion.attributes.versionString,
    build: "N/A" // Build requires a separate call if needed
  };
}
