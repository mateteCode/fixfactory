import { Schema, model, Document, Types } from "mongoose";

export interface ISparePartRequest extends Document {
  issue: Types.ObjectId; // Incidencia que originó el pedido
  description: string; // Detalle del repuesto (ej: "Rodamiento SKF 6205")
  quantity: number; // Cantidad necesaria
  estimatedCost?: number; // Costo registrado por Compras
  status: "Solicitado" | "Comprado" | "En Stock";
  requestedBy: string; // Técnico que lo solicita
}

const sparePartSchema = new Schema<ISparePartRequest>(
  {
    issue: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    estimatedCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Solicitado", "Comprado", "En Stock"],
      default: "Solicitado",
    },
    requestedBy: { type: String, required: true },
  },
  {
    timestamps: true, // Para auditoría (RF-14)
  },
);

export default model<ISparePartRequest>("SparePartRequest", sparePartSchema);
