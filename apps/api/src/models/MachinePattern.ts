import mongoose, { Schema, Document } from "mongoose";

export interface IMachinePattern extends Document {
  brand: string;
  modelCode: string;
  name: string;
  technicalSpecs?: string;
  defaultImageUrl?: string;
  createdByCompany: mongoose.Types.ObjectId;
  isVerified: boolean;
  isPrivate: boolean;
}

const MachinePatternSchema = new Schema<IMachinePattern>(
  {
    brand: { type: String, required: true, uppercase: true, trim: true },
    modelCode: { type: String, required: true, uppercase: true, trim: true },
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

MachinePatternSchema.index({ brand: 1, modelCode: 1 }, { unique: true });

export default mongoose.model<IMachinePattern>(
  "MachinePattern",
  MachinePatternSchema,
);
