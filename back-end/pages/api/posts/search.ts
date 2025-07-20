import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Post from "../../../models/Post";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    return res
      .status(400)
      .json({ code: 400, message: "缺少搜索关键词", data: [] });
  }
  const regex = new RegExp(q, "i");
  const posts = await (Post as any)
    .find({
      visibility: "public",
      $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }],
    })
    .sort({ createdAt: -1 })
    .populate("author", "username avatar school jobIntention nickname");
  return res.status(200).json({ code: 200, message: "搜索成功", data: posts });
}

export default handler;
