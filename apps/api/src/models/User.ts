import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  OPERARIO = "OPERARIO",
  TECNICO = "TECNICO",
  MANTENIMIENTO = "MANTENIMIENTO",
  COMPRAS = "COMPRAS",
  GERENTE = "GERENTE",
  ASISTENTE = "ASISTENTE",
  ADMIN = "ADMIN",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company: Types.ObjectId;
  active: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.OPERARIO,
    },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model<IUser>("User", userSchema);
