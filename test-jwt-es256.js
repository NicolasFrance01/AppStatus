const jwt = require('jsonwebtoken');

function trySign(key, label) {
  try {
    jwt.sign({ test: 1 }, key, { algorithm: 'ES256' });
    console.log(label, 'SUCCESS');
  } catch(e) {
    console.log(label, 'ERROR:', e.message);
  }
}

// Case 1: missing header
trySign('MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg...', 'Missing header');

// Case 2: symmetric key
trySign('somesecret', 'Symmetric');

// Case 3: good ECDSA key (we need to generate one to test variants)
const crypto = require('crypto');
const { privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

trySign(privateKey, 'Valid Key');

// Case 4: Spaces instead of newlines
const spaced = privateKey.replace(/\n/g, ' ');
trySign(spaced, 'Spaced');

// Case 5: Literal \n instead of newlines
const literal = privateKey.replace(/\n/g, '\\n');
trySign(literal, 'Literal \\n');

// Case 6: Our parser on spaced
let body = spaced.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\s+/g, '');
const lines = body.match(/.{1,64}/g) || [body];
const fixed = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
trySign(fixed, 'Fixed Spaces');

