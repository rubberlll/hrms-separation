import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  phone?: string;
  role: "admin" | "hr" | "employee" | "user";
  status: "active" | "inactive" | "pending";
  department?: mongoose.Types.ObjectId;
  avatar?: string;
  entryDate?: Date;
  employmentType?: "全职" | "兼职" | "实习";
  createdAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },
    phone: { type: String },
    role: {
      type: String,
      enum: ["admin", "hr", "employee", "user"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    avatar: String,
    entryDate: Date,
    employmentType: {
      type: String,
      enum: ["全职", "兼职", "实习"],
    },
  },
  { timestamps: true }
);

// 修改密码验证方法为使用bcrypt
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 保存前加密密码
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 定义User模型实例类型
const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// 导出类型化的模型
export default UserModel as mongoose.Model<IUser>;
