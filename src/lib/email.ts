import nodemailer from 'nodemailer';
import { Platform } from '@/generated/client';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'gppasajedroid@gmail.com',
    pass: process.env.SMTP_PASS || 'fszz ilwv uaee eeds',
  },
});

const SYSTEM_LOGO = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/logo.png` : 'https://app-status-green.vercel.app/logo.png';

export async function sendWelcomeEmail(to: string, name: string, username: string, tempPass: string, loginUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <img src="${SYSTEM_LOGO}" alt="Algeiba Logo" style="height: 48px;" />
        <h2 style="color: white; margin: 12px 0 0 0;">Bienvenido a AppStatus</h2>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="color: #334155; font-size: 16px;">Hola <strong>${name}</strong>,</p>
        <p style="color: #334155; font-size: 16px;">Se ha creado tu cuenta en el sistema de gestión de aplicaciones móviles de Algeiba.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px; text-transform: uppercase; font-weight: bold;">Tus Credenciales</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Usuario:</strong> ${username}</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Contraseña Temporal:</strong> <code style="background-color:#e2e8f0; padding:2px 6px; border-radius:4px;">${tempPass}</code></p>
        </div>

        <p style="color: #ef4444; font-weight: bold; font-size: 14px;">⚠️ Importante: Esta contraseña caducará en 48 horas. Debes ingresar y cambiarla desde la sección "Mi Perfil".</p>
        
        <div style="text-align: center; margin-top: 32px;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ingresar al Sistema</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; color: #64748b; font-size: 12px;">
        Este es un mensaje automático, por favor no respondas a este correo.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Algeiba AppStatus" <gppasajedroid@gmail.com>',
    to,
    subject: 'Tus credenciales de acceso a AppStatus',
    html,
  });
}

export async function sendStatusAlertEmail(
  adminEmails: string[], 
  appName: string, 
  oldStatus: string | null, 
  newStatus: string, 
  platform: Platform, 
  entity: string | null
) {
  if (adminEmails.length === 0) return;

  const isEmpresas = appName.toLowerCase().includes('empresas');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app-status-green.vercel.app';
  
  const entityMap: Record<string, string> = {
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

  const platformLogo = platform === Platform.ANDROID
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/32px-Android_robot.svg.png'
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/32px-Apple_logo_black.svg.png';

  const dashboardUrl = process.env.NEXTAUTH_URL || baseUrl;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; position: relative;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left">
              <img src="${platformLogo}" alt="${platform}" style="height: 24px; vertical-align: middle;" />
            </td>
            <td align="right">
              <img src="${entityLogo}" alt="${entity || 'Logo'}" style="height: 32px; vertical-align: middle;" />
            </td>
          </tr>
        </table>
        <h2 style="color: white; margin: 20px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Alerta de Tienda</h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Cambio de estado detectado</p>
      </div>
      
      <!-- Content -->
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
          <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);">Ver en Dashboard</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 500;">
          © ${new Date().getFullYear()} Algeiba AppStatus • Notificación Automática
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Algeiba Alertas" <gppasajedroid@gmail.com>',
    to: adminEmails.join(', '),
    subject: `Alerta: Cambio de Estado en ${appName}`,
    html,
  });
}

export async function sendUserHelpEmail(adminEmails: string[], username: string, errorMessage: string) {
  if (adminEmails.length === 0) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #ef4444; padding: 24px; text-align: center;">
        <h2 style="color: white; margin: 0;">Petición de Ayuda 🚨</h2>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="color: #334155; font-size: 16px;">El usuario <strong>${username}</strong> ha reportado un problema para ingresar al sistema.</p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #fca5a5;">
          <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: bold;">Mensaje de error:</p>
          <p style="margin: 0; color: #7f1d1d;">${errorMessage}</p>
        </div>
        <p style="color: #334155; font-size: 14px;">Por favor, revisa los permisos o resetea su contraseña desde el panel de administración.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Algeiba Soporte" <gppasajedroid@gmail.com>',
    to: adminEmails.join(', '),
    subject: `Soporte Requerido: Problemas de Login (${username})`,
    html,
  });
}
