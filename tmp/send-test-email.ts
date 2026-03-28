import { sendFirebaseReleaseEmail } from '../src/lib/email';
import { Platform } from '../src/generated/client/index.js';

async function test() {
  console.log('Sending test Firebase email to nfrance@algeiba.com...');
  try {
    await sendFirebaseReleaseEmail(
      ['nfrance@algeiba.com'],
      'BSC Banca Empresas (ANDROID)',
      '22.75.0',
      '2275001',
      Platform.ANDROID,
      'Banco Santa Cruz',
      '• Corrección de errores en transferencias\n• Mejoras en el rendimiento de la cámara para escaneo de QR\n• Actualización de seguridad mensual'
    );
    console.log('Success! Email sent.');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

test();
