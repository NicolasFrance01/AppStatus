const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'gppasajedroid@gmail.com',
    pass: process.env.SMTP_PASS || 'fszz ilwv uaee eeds',
  },
});

async function sendTest() {
  const adminEmail = 'nfrance@algeiba.com';
  const appName = 'BSC Banca Empresas (ANDROID)';
  const version = '22.75.0';
  const buildNumber = '2275001';
  const platform = 'ANDROID';
  const entity = 'Banco Santa Cruz';
  const releaseNotes = '• Corrección de errores en transferencias\n• Mejoras en el rendimiento de la cámara para escaneo de QR\n• Actualización de seguridad mensual';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app-status-green.vercel.app';
  const entityLogo = `${baseUrl}/logos/santa-cruz-empresas.png`;
  const platformLogo = platform === 'ANDROID'
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/64px-Android_robot.svg.png'
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/64px-Apple_logo_black.svg.png';
    
  const firebaseLogo = 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_256dp.png';

  console.log('Sending test Firebase email to:', adminEmail);

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #ffca28;">
      <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left">
              <img src="${platformLogo}" alt="${platform}" style="height: 24px; vertical-align: middle; margin-right: 8px;" />
              <img src="${firebaseLogo}" alt="Firebase" style="height: 24px; vertical-align: middle;" />
            </td>
            <td align="right">
              <img src="${entityLogo}" alt="${entity}" style="height: 32px; vertical-align: middle;" />
            </td>
          </tr>
        </table>
        <h2 style="color: white; margin: 20px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nueva Versión Firebase</h2>
        <p style="color: #ffca28; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">🔥 Distribución Detectada</p>
      </div>
      <div style="padding: 40px 32px; background-color: #ffffff; text-align: center;">
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          Se ha detectado una nueva versión de <span style="font-weight: 800; color: #0f172a; font-size: 18px;">${appName}</span> disponible en Firebase App Distribution.
        </p>
        <div style="background-color: #fff8e1; border-radius: 16px; padding: 32px 20px; border: 1px dashed #ffca28; display: inline-block; min-width: 80%;">
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Versión</p>
            <div style="color: #0f172a; font-size: 24px; font-weight: 900;">${version} <span style="color: #94a3b8; font-size: 16px; font-weight: 500;">(${buildNumber})</span></div>
          </div>
          <div style="text-align: left; background-color: white; padding: 16px; border-radius: 12px; border: 1px solid #ffe082; margin-top: 16px;">
             <p style="margin: 0 0 8px 0; color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase;">Notas de Lanzamiento:</p>
             <p style="margin: 0; color: #334155; font-size: 13px; white-space: pre-wrap;">${releaseNotes}</p>
          </div>
        </div>
        <div style="margin-top: 40px;">
          <a href="${baseUrl}" style="background-color: #ffa000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(255, 160, 0, 0.2);">Ver Dashboard Firebase</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 500;">
          © ${new Date().getFullYear()} Algeiba AppStatus • Notificación de Firebase
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Algeiba Firebase" <gppasajedroid@gmail.com>',
      to: adminEmail,
      subject: `🔥 Firebase: Nueva versión en ${appName} (${version})`,
      html,
    });
    console.log('Success! Email sent to nfrance@algeiba.com');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

sendTest();
