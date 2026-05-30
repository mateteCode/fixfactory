import { Schema, model, Document, Types } from "mongoose";

export enum PreventiveStatus {
  PROGRAMADO = "Programado",
  VENCIDO = "Vencido",
  ASIGNADO = "Asignado",
  EN_PROCESO = "En Proceso",
  REALIZADO = "Realizado",
}

export interface IPreventiveMaintenance extends Document {
  machine: Types.ObjectId;
  taskName: string; // Ej: "Cambio de aceite"
  frequencyDays: number;
  lastDate?: Date; // Fecha de última realización
  nextDate: Date; // Fecha programada para la próxima vez
  description?: string;
  status: PreventiveStatus;
  company: Types.ObjectId;
  assignedTo?: Types.ObjectId; // Tecnico asignado
}

const preventiveSchema = new Schema<IPreventiveMaintenance>(
  {
    machine: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    taskName: { type: String, required: true },
    frequencyDays: { type: Number, required: true },
    lastDate: { type: Date },
    nextDate: { type: Date, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: Object.values(PreventiveStatus),
      default: PreventiveStatus.PROGRAMADO,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

export default model<IPreventiveMaintenance>(
  "PreventiveMaintenance",
  preventiveSchema,
);
