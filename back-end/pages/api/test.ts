import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  return res.status(200).json({
    code: 200,
    message: "测试成功",
    data: {
      time: new Date().toISOString(),
      message: "Hello Next.js!",
    },
  });
}
