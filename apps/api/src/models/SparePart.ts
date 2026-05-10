import { Schema, model, Document, Types } from "mongoose";

export interface ISparePart extends Document {
  model: string;
  brand: string;
  description: string;
  stockQuantity: number;
  price: number;
  compatibleMachines: Types.ObjectId[]; // Máquinas en las que se puede usar
  company: Types.ObjectId;
  active: boolean; // Para el borrado lógico
}

const sparePartSchema = new Schema<ISparePart>(
  {
    model: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    stockQuantity: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    compatibleMachines: [{ type: Schema.Types.ObjectId, ref: "Machine" }],
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export default model<ISparePart>("SparePart", sparePartSchema);
