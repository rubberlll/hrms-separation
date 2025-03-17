import mongoose, { Document, Schema } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  manager?: mongoose.Types.ObjectId;
  parentDepartment?: mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    parentDepartment: { type: Schema.Types.ObjectId, ref: "Department" },
  },
  { timestamps: true }
);

export default mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);
