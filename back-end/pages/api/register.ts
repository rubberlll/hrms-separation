import type { NextApiRequest, NextApiResponse } from "next";
import User, { IUser } from "../../models/User";
import dbConnect from "../../lib/mongodb";

type ResponseData = {
  success?: boolean;
  message?: string;
  user?: any;
  code?: number;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // 只允许POST请求
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "只允许POST请求" });
  }

  try {
    // 连接数据库
    await dbConnect();

    const { username, password, email } = req.body;

    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "用户名、密码和邮箱为必填项",
      });
    }

    // 检查用户名是否已存在
    const existingUsername = (await User.findOne({ username })) as IUser | null;
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "用户名已被使用",
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = (await User.findOne({ email })) as IUser | null;
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "邮箱已被注册",
      });
    }

    // 创建新用户
    const newUser = new User({
      username,
      password,
      email,
      role: "user", // 默认角色为普通用户
      status: "pending", // 默认状态为待激活
    });

    // 保存用户到数据库
    await newUser.save();

    // 返回成功响应
    return res.status(201).json({
      code: 201,
      message: "注册成功，请登录",
      data: null,
    });
  } catch (error) {
    console.error("注册API错误:", error);
    return res.status(500).json({
      success: false,
      message: "服务器错误，请稍后再试",
    });
  }
}
