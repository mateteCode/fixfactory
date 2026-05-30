import mongoose, { Schema, Document } from "mongoose";

export interface ISparePartPattern extends Document {
  brand: string;
  partNumber: string;
  name: string;
  technicalSpecs?: string;
  defaultImageUrl?: string;
  createdByCompany: mongoose.Types.ObjectId;
  isVerified: boolean;
  isPrivate: boolean;
}

const SparePartPatternSchema = new Schema<ISparePartPattern>(
  {
    brand: { type: String, required: true, uppercase: true, trim: true },
    partNumber: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    technicalSpecs: { type: String },
    defaultImageUrl: { type: String },
    createdByCompany: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    isVerified: { type: Boolean, default: true, required: true },
    isPrivate: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

SparePartPatternSchema.index({ brand: 1, partNumber: 1 }, { unique: true });

export default mongoose.model<ISparePartPattern>(
  "SparePartPattern",
  SparePartPatternSchema,
);
