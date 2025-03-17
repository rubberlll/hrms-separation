import type { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware } from "../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  // 用户信息已在中间件中验证，可以直接返回
  const user = (req as any).user;

  return res.status(200).json({
    code: 200,
    message: "token有效",
    data: user,
  });
}

export default authMiddleware(handler);
