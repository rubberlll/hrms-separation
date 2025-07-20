import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Post from "../../../models/Post";
import { authMiddleware } from "../../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    // 获取单个帖子详情
    const post = await (Post as any)
      .findById(id)
      .populate("author", "username avatar");
    if (!post) {
      return res.status(404).json({ code: 404, message: "帖子不存在" });
    }
    return res
      .status(200)
      .json({ code: 200, message: "获取帖子详情成功", data: post });
  } else if (req.method === "DELETE") {
    // 删除帖子
    const deleted = await (Post as any).findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ code: 404, message: "帖子不存在" });
    }
    return res.status(200).json({ code: 200, message: "删除帖子成功" });
  } else {
    return res.status(405).json({ code: 405, message: "方法不允许" });
  }
}

export default authMiddleware(handler);
