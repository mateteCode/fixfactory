import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendNotification = async (
  to: string,
  subject: string,
  text: string,
) => {
  try {
    await transporter.sendMail({
      from: '"FixFactory System" <noreply@fixfactory.com>',
      to,
      subject,
      text,
    });
    console.log(`Email enviado a ${to}`);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
};
