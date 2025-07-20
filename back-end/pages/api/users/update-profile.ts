import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await connectDB();
      const { userId } = req.query;
      if (!userId) {
        return res
          .status(400)
          .json({ code: 400, message: "用户ID不能为空", data: null });
      }
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ code: 404, message: "用户不存在", data: null });
      }
      const userObj = user.toObject() as any;
      userObj.userId = userObj._id;
      return res
        .status(200)
        .json({ code: 200, message: "获取用户信息成功", data: userObj });
    } catch (error) {
      return res
        .status(500)
        .json({ code: 500, message: "服务器错误", data: null });
    }
  } else if (req.method === "PUT") {
    try {
      await connectDB();
      const { userId, ...updateData } = req.body;
      if (!userId) {
        return res
          .status(400)
          .json({ code: 400, message: "用户ID不能为空", data: null });
      }
      // 不允许直接改密码
      delete updateData.password;
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");
      if (!updatedUser) {
        return res
          .status(404)
          .json({ code: 404, message: "用户不存在", data: null });
      }
      return res
        .status(200)
        .json({ code: 200, message: "用户信息更新成功", data: updatedUser });
    } catch (error) {
      return res
        .status(500)
        .json({ code: 500, message: "服务器错误", data: null });
    }
  } else {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }
}

export default handler;
