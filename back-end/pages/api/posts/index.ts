import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Post from "../../../models/Post";
import { authMiddleware } from "../../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  if (req.method === "POST") {
    // 创建帖子
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ code: 400, message: "缺少参数" });
    }
    const post = await (Post as any).create({ title, content, author });
    return res.status(201).json({ code: 201, message: "发帖成功", data: post });
  } else if (req.method === "GET") {
    // 获取帖子列表
    const posts = await (Post as any)
      .find()
      .sort({ createdAt: -1 })
      .populate("author", "username avatar");
    return res
      .status(200)
      .json({ code: 200, message: "获取帖子列表成功", data: posts });
  } else {
    return res.status(405).json({ code: 405, message: "方法不允许" });
  }
}

export default authMiddleware(handler);
