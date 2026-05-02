import { Schema, model, Document, Types } from "mongoose";

export interface IPreventiveMaintenance extends Document {
  machine: Types.ObjectId; // Máquina asociada
  taskName: string; // Ej: "Cambio de aceite"
  frequencyDays: number; // Frecuencia en días
  lastDate: Date; // Fecha de última realización
  nextDate: Date; // Fecha programada para la próxima vez
  description?: string;
  status: "Programado" | "Vencido" | "Realizado";
  company: Types.ObjectId;
}

const preventiveSchema = new Schema<IPreventiveMaintenance>(
  {
    machine: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    taskName: { type: String, required: true },
    frequencyDays: { type: Number, required: true },
    lastDate: { type: Date, default: Date.now },
    nextDate: { type: Date, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Programado", "Vencido", "Realizado"],
      default: "Programado",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Trazabilidad (RF-14)
  },
);

export default model<IPreventiveMaintenance>(
  "PreventiveMaintenance",
  preventiveSchema,
);
