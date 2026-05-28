import mongoose, { Schema, model, Document, Types } from "mongoose";

export enum MachineStatus {
  OPERATIVA = "Operativa",
  MANTENIMIENTO = "Mantenimiento",
  EN_FALLA = "En Falla",
  APAGADA = "Apagada",
  NO_INSTALADA = "No Instalada",
}

// Interfaz para definir la estructura de la Máquina en el código
export interface IMachine extends Document {
  catalogRef: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  internalTag: string;
  status: MachineStatus;
  productionLine?: string;
  location?: string;
  installationDate?: Date;
  purchasePrice?: number;
  active: boolean;
  createdAt: Date;
}

// Esquema de MongoDB siguiendo el requerimiento RF-01
const MachineSchema = new Schema<IMachine>(
  {
    catalogRef: {
      type: Schema.Types.ObjectId,
      ref: "MachinePattern",
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    internalTag: { type: String, required: true, uppercase: true, trim: true },
    status: {
      type: String,
      enum: Object.values(MachineStatus),
      default: MachineStatus.OPERATIVA,
    },
    productionLine: { type: String },
    location: { type: String },
    installationDate: { type: Date },
    purchasePrice: { type: Number, min: 0 },
    active: { type: Boolean, default: true, required: true },
  },
  { timestamps: true },
);

MachineSchema.pre("save", function () {
  const machine = this as IMachine;

  if (!machine.installationDate) {
    machine.status = MachineStatus.NO_INSTALADA;
  }
});

MachineSchema.index({ company: 1, internalTag: 1 }, { unique: true });

export default mongoose.model<IMachine>("Machine", MachineSchema);
