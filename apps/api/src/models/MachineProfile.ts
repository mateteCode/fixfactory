import mongoose, { Schema, Document } from "mongoose";

export interface IMachineProfile extends Document {
  catalogRef: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  customImageUrl?: string;
  serviceManuals: string[];
  operationalNotes?: string;
  images: string[];
}

const MachineProfileSchema = new Schema<IMachineProfile>(
  {
    catalogRef: {
      type: Schema.Types.ObjectId,
      ref: "MachinePattern",
      required: true,
    },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    customImageUrl: { type: String },
    serviceManuals: [{ type: String }],
    operationalNotes: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true },
);

MachineProfileSchema.index({ catalogRef: 1, company: 1 }, { unique: true });

export default mongoose.model<IMachineProfile>(
  "MachineProfile",
  MachineProfileSchema,
);
