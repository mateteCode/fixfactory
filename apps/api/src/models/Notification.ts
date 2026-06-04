import mongoose, { Schema, Document, Types } from "mongoose";

export enum NotificationType {
  ISSUE = "ISSUE",
  SPARE_PART = "SPARE_PART",
  PREVENTIVE = "PREVENTIVE",
  SYSTEM = "SYSTEM",
}

export interface INotification extends Document {
  recipient: Types.ObjectId; // Usuario que recibe la notificación
  company: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string; // Ruta del frontend a donde debe redirigir
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    link: { type: String }, // Ej: "/incidents" o "/purchases"
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
