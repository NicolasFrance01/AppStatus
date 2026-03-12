# Mobile Store API Integration Examples

This document provides technical examples of how to interact with the Google Play and App Store Connect APIs to retrieve application status.

## 1. App Store Connect API (iOS)

To authenticate, you need a JWT signed with your private key (`.p8`).

### JWT Generation
```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('AuthKey_XXXXXXXXXX.p8'); // Your private key
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '20m',
  issuer: 'YOUR_ISSUER_ID',
  header: {
    alg: 'ES256',
    kid: 'YOUR_KEY_ID',
    typ: 'JWT'
  }
});
```

### Fetching App Status
```javascript
const response = await fetch('https://api.appstoreconnect.apple.com/v1/apps?include=appStoreVersions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Example Status Mapping
// appStoreState: 'READY_FOR_SALE' -> 🟢 Productiva
// appStoreState: 'WAITING_FOR_REVIEW' -> 🟡 En revisión
```

---

## 2. Google Play Developer API (Android)

Using the official `googleapis` library.

### Authentication & Fetching Status
```javascript
const { google } = require('googleapis');
const publisher = google.androidpublisher('v3');

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
});

const authClient = await auth.getClient();
google.options({ auth: authClient });

// Get App Info
const edit = await publisher.edits.insert({ packageName: 'com.example.app' });
const tracks = await publisher.edits.tracks.list({
  editId: edit.data.id,
  packageName: 'com.example.app'
});

// tracks.data.tracks might contain production, beta, alpha statuses.
```

## Status Mapping Table

| Store Status (Apple) | Store Status (Google) | Dashboard Status | Logic Color |
|----------------------|-----------------------|------------------|-------------|
| READY_FOR_SALE       | completed             | Published        | 🟢 Green     |
| WAITING_FOR_REVIEW   | inProgress            | In Review        | 🟡 Yellow    |
| PENDING_DEVELOPER_RELEASE | -                | Pending Release  | 🔵 Blue      |
| REJECTED             | rejected              | Rejected         | 🔴 Red       |
| ACTION_REQUIRED      | actionRequired        | Action Required  | 🔴 Red       |
