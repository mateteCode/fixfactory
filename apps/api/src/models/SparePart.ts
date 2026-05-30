// src/models/SparePart.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISparePart extends Document {
  catalogRef: Types.ObjectId;
  company: Types.ObjectId;
  internalCode?: string; // SKU interno opcional (Ej: REP-001)
  stockQuantity: number;
  minStock: number;
  price: number;
  location?: string;
  active: boolean;
  createdAt: Date;
}

const sparePartSchema = new Schema<ISparePart>(
  {
    catalogRef: {
      type: Schema.Types.ObjectId,
      ref: "SparePartPattern",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    internalCode: { type: String, uppercase: true, trim: true },
    stockQuantity: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 1, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    location: { type: String },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

sparePartSchema.index({ catalogRef: 1, company: 1 }, { unique: true });

export default mongoose.model<ISparePart>("SparePart", sparePartSchema);
