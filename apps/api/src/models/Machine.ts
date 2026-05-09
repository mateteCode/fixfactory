import { Schema, model, Document, Types } from "mongoose";

// Interfaz para definir la estructura de la Máquina en el código
export interface IMachine extends Document {
  code: string;
  name: string;
  location: string;
  productionLine: string;
  installationDate: Date;
  technicalManualUrl?: string;
  company: Types.ObjectId;
  status?: "Operativa" | "Mantenimiento" | "En Falla";
  //TODO: Agregar type: tipo de maquinaria, status: Operativa, Mantenimiento, En Falla
}

// Esquema de MongoDB siguiendo el requerimiento RF-01
const machineSchema = new Schema<IMachine>(
  {
    code: { type: String, required: true, unique: true }, //TODO: Hacer que la el codigo sea único solo para la empresa
    name: { type: String, required: true },
    location: { type: String, required: true },
    productionLine: { type: String, required: true },
    installationDate: { type: Date, required: true },
    technicalManualUrl: { type: String },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Operativa", "Mantenimiento", "En Falla"],
      default: "Operativa",
    },
  },
  {
    timestamps: true,
  },
);

export default model<IMachine>("Machine", machineSchema);
