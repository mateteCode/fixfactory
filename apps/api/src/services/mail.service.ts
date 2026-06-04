import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envía una notificación de nueva incidencia (RF-04)
 */
export const sendIssueNotification = async (issueDetails: any) => {
  const { machineName, priority, reportedBy, description } = issueDetails;

  const mailOptions = {
    from: '"FixFactory Alertas" <noreply@fixfactory.com>',
    to: process.env.MAINTENANCE_LEAD_EMAIL,
    subject: `⚠️ NUEVA INCIDENCIA: ${priority} - ${machineName}`,
    text: `Se ha reportado una nueva falla.\n\nDetalles:\n- Máquina: ${machineName}\n- Reportado por: ${reportedBy}\n- Descripción: ${description}\n\nPor favor, ingrese al sistema para asignar un técnico.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Notificación enviada con éxito.");
  } catch (error) {
    console.error("Error enviando notificación:", error);
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  plainPassword: string,
) => {
  const mailOptions = {
    from: '"CMMS FixFactory" <no-reply@fixfactory.com>',
    to: email,
    subject: "Bienvenido a CMMS - Tus credenciales de acceso",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>¡Hola ${name}!</h2>
        <p>Has sido registrado en la plataforma CMMS de la empresa.</p>
        <p>Tus credenciales de acceso son:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contraseña:</strong> <span style="font-family: monospace; font-size: 16px;">${plainPassword}</span></p>
        </div>
        <p>Te recomendamos cambiar esta contraseña desde tu perfil una vez que inicies sesión.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Correo de bienvenida enviado a ${email}`);
  } catch (error) {
    console.error(
      `[Email Error] No se pudo enviar el correo a ${email}:`,
      error,
    );
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Cambiá este puerto por el que use tu frontend localmente (ej: 5173 para Vite)
  const resetUrl = `http://localhost:5173/reset-password/${token}`;

  const mailOptions = {
    from: '"CMMS FixFactory" <no-reply@fixfactory.com>',
    to: email,
    subject: "Recuperación de Contraseña - CMMS",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Recuperación de Acceso</h2>
        <p>Has solicitado restablecer tu contraseña en la plataforma.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace es válido por 1 hora:</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #374151; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Restablecer mi contraseña
          </a>
        </div>
        <p style="font-size: 12px; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Correo de recuperación enviado a ${email}`);
  } catch (error) {
    console.error(
      `[Email Error] No se pudo enviar el correo a ${email}:`,
      error,
    );
  }
};

export const sendGenericEmail = async (
  to: string,
  subject: string,
  message: string,
  link?: string,
) => {
  // Usamos la URL base de tu frontend (ej: http://localhost:5173)
  const baseUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
  const buttonHtml = link
    ? `<div style="margin: 25px 0;">
         <a href="${baseUrl}${link}" style="background-color: #4B5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
           Ver en la plataforma
         </a>
       </div>`
    : "";

  const mailOptions = {
    from: '"FixFactory Notificaciones" <no-reply@fixfactory.com>',
    to,
    subject: `CMMS: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">
          Notificación del Sistema
        </h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          ${message}
        </p>
        ${buttonHtml}
        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
          Este es un correo automático generado por tu plataforma CMMS FixFactory. Por favor, no respondas a este correo.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Correo genérico enviado a ${to}`);
  } catch (error) {
    console.error(`[Email Error] No se pudo enviar el correo a ${to}:`, error);
  }
};
