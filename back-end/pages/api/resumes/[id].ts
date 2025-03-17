import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Resume from "../../../models/Resume";
import { authMiddleware, roleCheck } from "../../../middleware/auth";
import { Model } from "mongoose";
import { IResume } from "../../../models/Resume"; // 假设这个接口存在，如果不存在需要创建

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const user = (req as any).user;

  try {
    await connectDB();

    if (req.method === "GET") {
      const resume = await (Resume as Model<IResume>)
        .findById(id)
        .populate("userId", "username email")
        .populate("jobId", "title department");

      if (!resume) {
        return res.status(404).json({
          code: 404,
          message: "简历不存在",
          data: null,
        });
      }

      // 检查权限：只有HR、管理员或简历所有者可以查看
      if (
        user.role !== "admin" &&
        user.role !== "hr" &&
        resume.userId._id.toString() !== user.userId
      ) {
        return res.status(403).json({
          code: 403,
          message: "无权访问此简历",
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "获取简历详情成功",
        data: resume,
      });
    }

    if (req.method === "PUT") {
      // 只有HR和管理员可以更新简历状态
      if (user.role !== "admin" && user.role !== "hr") {
        return res.status(403).json({
          code: 403,
          message: "无权更新简历状态",
          data: null,
        });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          code: 400,
          message: "请提供状态字段",
          data: null,
        });
      }

      const updatedResume = await (Resume as Model<IResume>).findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedResume) {
        return res.status(404).json({
          code: 404,
          message: "简历不存在",
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "更新简历状态成功",
        data: updatedResume,
      });
    }

    if (req.method === "DELETE") {
      const resume = await (Resume as Model<IResume>).findById(id);

      if (!resume) {
        return res.status(404).json({
          code: 404,
          message: "简历不存在",
          data: null,
        });
      }

      // 检查权限：只有管理员或简历所有者可以删除
      if (user.role !== "admin" && resume.userId.toString() !== user.userId) {
        return res.status(403).json({
          code: 403,
          message: "无权删除此简历",
          data: null,
        });
      }

      await (Resume as Model<IResume>).findByIdAndDelete(id);

      return res.status(200).json({
        code: 200,
        message: "删除简历成功",
        data: null,
      });
    }

    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "服务器错误", data: null });
  }
}

export default authMiddleware(handler);
