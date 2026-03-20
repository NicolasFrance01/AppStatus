import nodemailer from 'nodemailer';

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

export async function sendStatusAlertEmail(adminEmails: string[], appName: string, oldStatus: string | null, newStatus: string) {
  if (adminEmails.length === 0) return;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h2 style="color: white; margin: 0;">Alerta de Tienda 📲</h2>
      </div>
      <div style="padding: 32px; background-color: #ffffff;">
        <p style="color: #334155; font-size: 16px;">La aplicación <strong>${appName}</strong> ha cambiado su estado en la tienda oficial.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-decoration: line-through;">${oldStatus || 'Desconocido'}</p>
          <p style="margin: 8px 0; color: #0f172a; font-size: 20px; font-weight: bold;">⬇</p>
          <p style="margin: 0; color: #10b981; font-size: 18px; font-weight: black;">${newStatus}</p>
        </div>
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
