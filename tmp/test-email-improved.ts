import { sendStatusAlertEmail } from '../src/lib/email';
import { Platform } from '../src/generated/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

async function runTest() {
  const recipients = ['francenicolas.dw@gmail.com', 'nfrance@algeiba.com'];
  
  console.log('Sending BSJ Empresas (Android) test email...');
  await sendStatusAlertEmail(
    recipients,
    'BSJ Empresas',
    'PENDING_PUBLICATION',
    'PUBLISHED',
    Platform.ANDROID,
    'BSJ'
  );

  console.log('Sending BSF Individuos (iOS) test email...');
  await sendStatusAlertEmail(
    recipients,
    'BSF Individuos',
    'IN_REVIEW',
    'PENDING_PUBLICATION',
    Platform.IOS,
    'BSF'
  );

  console.log('Sending BER Empresas (Android) test email...');
  await sendStatusAlertEmail(
    recipients,
    'BER Empresas',
    'PUBLISHED',
    'ACTION_REQUIRED',
    Platform.ANDROID,
    'Banco Entre Ríos'
  );

  console.log('Test emails sent successfully!');
}

runTest().catch(console.error);
