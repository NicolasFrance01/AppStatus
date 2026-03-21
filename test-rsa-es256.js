const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

try {
  jwt.sign({ test: 1 }, privateKey, { algorithm: 'ES256' });
  console.log('RSA SUCCESS');
} catch(e) {
  console.log('RSA ERROR:', e.message);
}
