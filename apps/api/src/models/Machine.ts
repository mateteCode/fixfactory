import { Schema, model, Document } from "mongoose";

// Interfaz para definir la estructura de la Máquina en el código
export interface IMachine extends Document {
  code: string;
  name: string;
  location: string;
  productionLine: string;
  installationDate: Date;
  technicalManualUrl?: string;
}

// Esquema de MongoDB siguiendo el requerimiento RF-01
const machineSchema = new Schema<IMachine>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    productionLine: { type: String, required: true },
    installationDate: { type: Date, required: true },
    technicalManualUrl: { type: String },
  },
  {
    timestamps: true,
  },
);

export default model<IMachine>("Machine", machineSchema);
