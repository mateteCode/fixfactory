import { Schema, model, Document, Types } from "mongoose";

export enum CompanyPlan {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

export interface ICompany extends Document {
  name: string;
  taxId?: string; // CUIT, RUT o equivalente
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
      type: String, // CUIT
      unique: true,
      sparse: true, // Permite que no todos tengan taxId, pero los que tengan sean únicos
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
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  },
);

export default model<ICompany>("Company", companySchema);
