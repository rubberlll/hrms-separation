import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../lib/mongodb";
import User from "../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 添加请求信息日志
  console.log("收到登录请求:", {
    method: req.method,
    headers: {
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    },
    body: req.body,
    query: req.query,
    cookies: req.cookies,
    ip: req.socket.remoteAddress,
  });

  if (req.method !== "POST") {
    console.log("请求方法不允许:", req.method);
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  try {
    await connectDB();

    const { username, password } = req.body;
    console.log("尝试登录用户:", { username, passwordProvided: !!password });

    // 验证用户名和密码
    if (!username || !password) {
      console.log("登录失败: 缺少用户名或密码");
      return res
        .status(400)
        .json({ code: 400, message: "请提供用户名和密码", data: null });
    }

    // 查找用户
    const user = await User.findOne({ username }).select("+password");
    console.log("用户查询结果:", { found: !!user, username });

    if (!user) {
      console.log("登录失败: 用户不存在");
      return res
        .status(401)
        .json({ code: 401, message: "用户名或密码错误", data: null });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    console.log("密码验证结果:", { isMatch, username });

    if (!isMatch) {
      console.log("登录失败: 密码不匹配");
      return res
        .status(401)
        .json({ code: 401, message: "用户名或密码错误", data: null });
    }

    // 创建JWT
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const userInfo = {
      userId: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      status: user.status,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24小时过期
    };

    const token = jwt.sign(userInfo, secret);
    console.log("登录成功, 生成令牌:", {
      username,
      userId: user._id,
      role: user.role,
    });

    res.status(200).json({
      code: 200,
      message: "登录成功",
      data: {
        token,
        userInfo,
      },
    });
  } catch (error) {
    console.error("登录过程中发生错误:", error);

    // 提供更详细的错误信息
    const errorMessage =
      error instanceof Error ? `${error.name}: ${error.message}` : "未知错误";

    console.error("详细错误信息:", errorMessage);
    console.error("请求信息:", {
      body: req.body,
      headers: req.headers,
      method: req.method,
    });

    // 如果是开发环境，可以返回更详细的错误信息给前端
    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(500).json({
      code: 500,
      message: "服务器错误",
      data: null,
      debug: isDevelopment ? errorMessage : undefined,
    });
  }
}
