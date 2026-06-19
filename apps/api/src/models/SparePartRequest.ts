import { Schema, model, Document, Types } from "mongoose";

export enum SparePartStatus {
  SOLICITADO = "Solicitado",
  SIN_STOCK = "Sin Stock",
  COMPRADO = "Comprado",
  EN_STOCK = "En Stock",
  ACEPTADO = "Aceptado",
  RECHAZADO = "Rechazado",
}

export interface ISparePartRequest extends Document {
  issue?: Types.ObjectId; // Incidencia que originó el pedido
  preventive?: Types.ObjectId;
  machine?: Types.ObjectId;
  sparePart: Types.ObjectId; // Referencia al catálogo de repuestos
  quantity: number; // Cantidad necesaria
  estimatedCost?: number; //Snapshot del costo (congelado al momento de pedir/comprar)
  status: SparePartStatus;
  requestedBy: Types.ObjectId;
  company: Types.ObjectId;
}

const sparePartSchema = new Schema<ISparePartRequest>(
  {
    issue: { type: Schema.Types.ObjectId, ref: "Issue", required: false },
    preventive: {
      type: Schema.Types.ObjectId,
      ref: "PreventiveMaintenance",
      required: false,
    },
    machine: { type: Schema.Types.ObjectId, ref: "Machine", required: false },
    sparePart: {
      type: Schema.Types.ObjectId,
      ref: "SparePart",
      required: true,
    },
    quantity: { type: Number, default: 1 },
    estimatedCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(SparePartStatus),
      default: SparePartStatus.SOLICITADO,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Para auditoría (RF-14)
  },
);

export default model<ISparePartRequest>("SparePartRequest", sparePartSchema);
