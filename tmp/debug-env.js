
const dotenv = require('dotenv');
const fs = require('fs');

const result = dotenv.config();
if (result.error) {
  console.error('Dotenv error:', result.error);
}

const bsfJson = process.env.GOOGLE_BSF_SERVICE_ACCOUNT_JSON;
if (!bsfJson) {
  console.log('GOOGLE_BSF_SERVICE_ACCOUNT_JSON is MISSING');
} else {
  console.log('GOOGLE_BSF_SERVICE_ACCOUNT_JSON length:', bsfJson.length);
  try {
    JSON.parse(bsfJson);
    console.log('JSON parse SUCCESS');
  } catch (e) {
    console.log('JSON parse FAILED:', e.message);
    // Find the error position
    const match = e.message.match(/at position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]);
      console.log('Error at position:', pos);
      console.log('Context around error:', bsfJson.substring(Math.max(0, pos - 20), Math.min(bsfJson.length, pos + 20)));
    }
  }
}
