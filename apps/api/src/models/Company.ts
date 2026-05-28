import { Schema, model, Document, Types } from "mongoose";

export enum CompanyPlan {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

export interface ICompany extends Document {
  name: string;
  taxId?: string; // CUIT o equivalente
  address?: string;
  plan: CompanyPlan;
  owner: Types.ObjectId; // Referencia al Usuario que creó la empresa (ADMIN)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "El nombre de la empresa es obligatorio"],
      unique: true,
      trim: true,
    },
    taxId: {
      type: String,
      unique: true,
      sparse: true, // No es requerido pero si único. ignora los que son null
    },
    address: {
      type: String,
    },
    plan: {
      type: String,
      enum: Object.values(CompanyPlan),
      default: CompanyPlan.FREE,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<ICompany>("Company", companySchema);
