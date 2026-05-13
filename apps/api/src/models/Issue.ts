import { Schema, model, Document, Types } from "mongoose";

// Definición de estados según la minuta de relevamiento
export enum IssueStatus {
  PENDIENTE = "Pendiente",
  EN_PROCESO = "En Proceso",
  DIAGNOSTICADO = "Diagnóstico",
  EN_ESPERA_DE_REPUESTO = "En Espera de Repuesto",
  EN_REPARACION = "En Reparación",
  CERRADO = "Cerrado",
}

export enum IssuePriority {
  BAJA = "Baja",
  MEDIA = "Media",
  ALTA = "Alta",
  CRITICA = "Crítica",
}

export interface IIssue extends Document {
  machine: Types.ObjectId; // Referencia a la máquina
  description: string; // Descripción del problema
  priority: IssuePriority; // Prioridad
  status: IssueStatus; // Estado del ciclo de vida
  reportedBy: Types.ObjectId; // Operario que detectó la falla
  imageUrl?: string; // URL de la foto del problema
  technicalDiagnosis?: string; // Diagnóstico del técnico
  resolutionDetails?: string; // Qué se hizo para arreglarlo
  closedAt?: Date; // Fecha de cierre para métricas MTTR
  company: Types.ObjectId;
  assignedTo?: Types.ObjectId;
}

const issueSchema = new Schema<IIssue>(
  {
    machine: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(IssuePriority),
      default: IssuePriority.MEDIA,
    },
    status: {
      type: String,
      enum: Object.values(IssueStatus),
      default: IssueStatus.PENDIENTE,
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String },
    technicalDiagnosis: { type: String },
    resolutionDetails: { type: String },
    closedAt: { type: Date },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true, // Para cumplir con la trazabilidad y auditoría (RF-14)
  },
);

export default model<IIssue>("Issue", issueSchema);
