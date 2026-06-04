import User from "../models/User.js";
import Notification, { NotificationType } from "../models/Notification.js";
// import { sendEmail } from "../utils/mailer.js"; // Importa tu función actual de correos
import { sendGenericEmail } from "./mail.service.js";

export class NotificationService {
  /**
   * Envía una notificación a un usuario específico a través de múltiples canales.
   */
  static async sendToUser(
    userId: string,
    companyId: string,
    data: { title: string; message: string; type: string; link?: string },
    channels: ("IN_APP" | "EMAIL" | "WPP")[] = ["IN_APP", "EMAIL"],
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // 1. Notificación IN-APP (Campanita)
      if (channels.includes("IN_APP")) {
        await Notification.create({
          recipient: user._id,
          company: companyId,
          title: data.title,
          message: data.message,
          type: data.type as NotificationType,
          ...(data.link && { link: data.link }),
        });
      }

      // 2. Notificación por CORREO (Extrae el email del usuario)
      if (channels.includes("EMAIL") && user.email) {
        // await sendEmail(user.email, data.title, data.message);
        console.log(`[EMAIL ENVIADO a ${user.email}]: ${data.title}`);
        await sendGenericEmail(user.email, data.title, data.message, data.link);
      }

      // 3. Notificación por WHATSAPP (Preparado para el futuro)
      if (channels.includes("WPP")) {
        // const phone = user.phone;
        // await twilioService.sendWpp(phone, data.message);
        console.log(`[WPP LISTO PARA IMPLEMENTAR] Mensaje para: ${user.name}`);
      }
    } catch (error) {
      console.error("Error al enviar notificación:", error);
    }
  }

  /**
   * Envía notificación a todos los usuarios que tengan un Rol específico.
   */
  static async sendToRole(
    roles: string[],
    companyId: string,
    data: { title: string; message: string; type: string; link?: string },
    channels: ("IN_APP" | "EMAIL" | "WPP")[] = ["IN_APP", "EMAIL"],
  ) {
    const users = await User.find({ role: { $in: roles }, company: companyId });
    const promises = users.map((user) =>
      this.sendToUser(user._id.toString(), companyId, data, channels),
    );
    await Promise.all(promises);
  }
}
