const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'gppasajedroid@gmail.com',
    pass: process.env.SMTP_PASS || 'fszz ilwv uaee eeds',
  },
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app-status-green.vercel.app';

async function sendStatusAlertEmail(adminEmail, appName, oldStatus, newStatus, platform, entity) {
  const isEmpresas = appName.toLowerCase().includes('empresas');
  
  const entityMap = {
    'BSJ': 'san-juan',
    'Banco San Juan': 'san-juan',
    'BSF': 'santa-fe',
    'Banco Santa Fe': 'santa-fe',
    'BER': 'entre-rios',
    'Banco Entre Ríos': 'entre-rios',
    'BSC': 'santa-cruz',
    'Banco Santa Cruz': 'santa-cruz'
  };
  
  const logoName = entity && entityMap[entity] ? entityMap[entity] : 'logo';
  const entityLogo = isEmpresas 
    ? `${baseUrl}/logos/${logoName}-empresas.png`
    : `${baseUrl}/logos/${logoName}.png`;

  const platformLogo = platform === 'ANDROID'
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/64px-Android_robot.svg.png'
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/64px-Apple_logo_black.svg.png';

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left">
              <img src="${platformLogo}" alt="${platform}" style="height: 24px; vertical-align: middle;" />
            </td>
            <td align="right">
              <img src="${entityLogo}" alt="${entity}" style="height: 32px; vertical-align: middle;" />
            </td>
          </tr>
        </table>
        <h2 style="color: white; margin: 20px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Alerta de Tienda</h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Cambio de estado detectado</p>
      </div>
      <div style="padding: 40px 32px; background-color: #ffffff; text-align: center;">
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
          La aplicación <span style="font-weight: 800; color: #0f172a; font-size: 18px;">${appName}</span> ha actualizado su estado en la tienda oficial.
        </p>
        <div style="background-color: #f1f5f9; border-radius: 16px; padding: 32px 20px; border: 1px dashed #cbd5e1; display: inline-block; min-width: 80%;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="40%" align="center">
                <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Anterior</p>
                <div style="color: #94a3b8; font-size: 15px; text-decoration: line-through; font-weight: 600;">${oldStatus || 'N/A'}</div>
              </td>
              <td width="20%" align="center">
                <div style="font-size: 24px; color: #3b82f6; font-weight: bold;">➔</div>
              </td>
              <td width="40%" align="center">
                <p style="margin: 0; color: #3b82f6; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Nuevo</p>
                <div style="color: #059669; font-size: 18px; font-weight: 900;">${newStatus}</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 40px;">
          <a href="${baseUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);">Ver en Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 500;">
          © ${new Date().getFullYear()} Algeiba AppStatus • Notificación Automática
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Algeiba Alertas" <gppasajedroid@gmail.com>',
    to: adminEmail,
    subject: `Alerta: Cambio de Estado en ${appName}`,
    html,
  });
}

async function runTests() {
  const email = 'nfrance@algeiba.com';
  
  console.log('--- Sending Store Tests ---');
  
  // Test Android Store
  console.log('Sending Android Store test...');
  await sendStatusAlertEmail(email, 'BSF Banca Individuos (ANDROID)', 'IN_REVIEW', 'PUBLISHED', 'ANDROID', 'Banco Santa Fe');
  
  // Test iOS Store
  console.log('Sending iOS Store test...');
  await sendStatusAlertEmail(email, 'BER Banca Empresas (IOS)', 'PENDING_PUBLICATION', 'PUBLISHED', 'IOS', 'Banco Entre Ríos');
  
  console.log('Store tests completed.');
}

runTests().catch(console.error);
