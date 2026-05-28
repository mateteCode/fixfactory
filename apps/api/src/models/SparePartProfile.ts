import mongoose, { Schema, Document } from "mongoose";

export interface ISparePartProfile extends Document {
  catalogRef: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  customImageUrl?: string;
  manuals: string[];
  images: string[];
  compatibleMachines: mongoose.Types.ObjectId[];
  supplierLinks?: string[]; // Para que Compras sepa dónde pedirlo
}

const SparePartProfileSchema = new Schema<ISparePartProfile>(
  {
    catalogRef: {
      type: Schema.Types.ObjectId,
      ref: "SparePartPattern",
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    customImageUrl: { type: String },
    manuals: [{ type: String }],
    images: [{ type: String }],
    compatibleMachines: [{ type: Schema.Types.ObjectId, ref: "Machine" }],
    supplierLinks: [{ type: String }],
  },
  { timestamps: true },
);

SparePartProfileSchema.index({ catalogRef: 1, company: 1 }, { unique: true });

export default mongoose.model<ISparePartProfile>(
  "SparePartProfile",
  SparePartProfileSchema,
);
