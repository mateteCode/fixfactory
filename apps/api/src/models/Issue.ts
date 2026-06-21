import { Schema, model, Document, Types } from "mongoose";

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

export enum IssueType {
  MECANICO = "Mecánico",
  ELECTRICO = "Eléctrico",
  SOFTWARE = "Software",
  OTRO = "Otro",
}

export interface Diagnostic {
  _id?: string;
  technician: Types.ObjectId;
  description: string;
  images?: string[];
  createdAt: Date;
}

export interface Conclusion {
  description: string;
  images?: string[];
  finishedBy: Types.ObjectId;
  finishedAt: Date;
}

export interface IIssue extends Document {
  machine: Types.ObjectId;
  type: IssueType;
  description: string; // Descripción del operario del problema
  priority: IssuePriority;
  status: IssueStatus;
  reportedBy: Types.ObjectId; // Operario que detectó la falla
  imageUrl?: string; // URL de la foto del problema sacada por el operario
  technicalDiagnosis?: string; // Diagnóstico del técnico
  resolutionDetails?: string; // Qué se hizo para arreglarlo
  closedAt?: Date; // Fecha de cierre para métricas MTTR
  company: Types.ObjectId;
  assignedTo?: Types.ObjectId; // Técnico al que se le asignó la reparación
  repairImagesUrl?: string[]; // URL de las imagenes aportadas por el técnico
  diagnostics: Diagnostic[];
  conclusion?: Conclusion;
  scheduledAt?: Date; // Asignar fecha y hora de visita tecnica
  scheduledAtUpdatedAt?: Date;// Actualizacion de fecha y hora de la visita programada
}

const issueSchema = new Schema<IIssue>(
  {
    machine: { type: Schema.Types.ObjectId, ref: "Machine", required: true },
    type: {
      type: String,
      enum: Object.values(IssueType),
      default: IssueType.OTRO,
    },
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
    scheduledAt: { type: Date },
    scheduledAtUpdatedAt: { type: Date },
    repairImagesUrl: [{ type: String }],
    diagnostics: [
      {
        technician: { type: Schema.Types.ObjectId, ref: "User" },
        description: String,
        images: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    conclusion: {
      description: String,
      images: [String],
      finishedBy: { type: Schema.Types.ObjectId, ref: "User" },
      finishedAt: Date,
    },
  },
  {
    timestamps: true, // Para cumplir con la trazabilidad y auditoría (RF-14)
  },
);

export default model<IIssue>("Issue", issueSchema);
