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
