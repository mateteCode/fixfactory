import { Schema, model, Document, Types } from "mongoose";

// Definición de estados según la minuta de relevamiento [cite: 1326]
export type IssueStatus =
  | "Pendiente"
  | "En Proceso"
  | "En Espera de Repuesto"
  | "Solucionado"
  | "Cerrado";

export interface IIssue extends Document {
  machine: Types.ObjectId; // Referencia a la máquina
  description: string; // Descripción del problema
  priority: "Baja" | "Media" | "Alta"; // Prioridad
  status: IssueStatus; // Estado del ciclo de vida
  reportedBy: string; // Operario que detectó la falla
  imageUrl?: string; // URL de la foto del problema
  technicalDiagnosis?: string; // Diagnóstico del técnico
  resolutionDetails?: string; // Qué se hizo para arreglarlo
  closedAt?: Date; // Fecha de cierre para métricas MTTR
  company: string;
}

const issueSchema = new Schema<IIssue>(
  {
    machine: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
    },
    status: {
      type: String,
      enum: [
        "Pendiente",
        "En Proceso",
        "En Espera de Repuesto",
        "Solucionado",
        "Cerrado",
      ],
      default: "Pendiente",
    },
    reportedBy: { type: String, required: true },
    imageUrl: { type: String },
    technicalDiagnosis: { type: String },
    resolutionDetails: { type: String },
    closedAt: { type: Date },
    company: { type: String, required: true, index: true },
  },
  {
    timestamps: true, // Para cumplir con la trazabilidad y auditoría (RF-14)
  },
);

export default model<IIssue>("Issue", issueSchema);
