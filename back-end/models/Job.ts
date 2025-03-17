import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  department: mongoose.Types.ObjectId;
  description: string;
  location: string;
  salaryRange?: string;
  status: "open" | "closed" | "archived";
  jobType?: "社招" | "校招" | "实习";
  expiryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    description: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: String,
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
    },
    jobType: {
      type: String,
      enum: ["社招", "校招", "实习"],
    },
    expiryDate: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// 创建全文索引
JobSchema.index({ title: "text", description: "text" });

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
