import mongoose from "mongoose";

// 定义更明确的类型
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 确保全局类型声明匹配
declare global {
  var mongoose: {
    conn: any | null;
    promise: Promise<any> | null;
  };
}

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hrm-system";

if (!MONGODB_URI) {
  throw new Error("请在环境变量中定义 MONGODB_URI");
}

// 初始化缓存
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectDB;
