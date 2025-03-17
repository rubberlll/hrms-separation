import mongoose, { Document, Schema } from "mongoose";

export interface Education {
  school: string;
  major: string;
  degree: string;
  graduationYear: string;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  education?: Education;
  workExperience?: Experience[];
  skills?: string[];
  status: "pending" | "reviewed" | "hired" | "rejected";
  jobId?: mongoose.Types.ObjectId;
  submittedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    education: {
      school: String,
      major: String,
      degree: String,
      graduationYear: String,
    },
    workExperience: [
      {
        company: String,
        position: String,
        duration: String,
        description: String,
      },
    ],
    skills: [String],
    status: {
      type: String,
      enum: ["pending", "reviewed", "hired", "rejected"],
      default: "pending",
    },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 创建索引
ResumeSchema.index({ userId: 1 });
ResumeSchema.index({ status: 1 });

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);
