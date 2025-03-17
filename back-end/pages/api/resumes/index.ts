import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Resume from "../../../models/Resume";
import { authMiddleware } from "../../../middleware/auth";
import { Model } from "mongoose";
import { IResume } from "../../../models/Resume"; // 假设您有这个接口

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const user = (req as any).user;

      // 根据用户角色决定返回哪些简历
      let query = {};
      if (user.role === "user") {
        // 普通用户只能查看自己的简历
        query = { userId: user.userId };
      }

      const resumes = await (Resume as Model<IResume>)
        .find(query)
        .populate("userId", "username email")
        .populate("jobId", "title department")
        .sort({ submittedAt: -1 });

      return res.status(200).json({
        code: 200,
        message: "获取简历列表成功",
        data: resumes,
      });
    }

    if (req.method === "POST") {
      const { fileUrl, fileName, education, workExperience, skills, jobId } =
        req.body;
      const user = (req as any).user;

      if (!fileUrl || !fileName) {
        return res.status(400).json({
          code: 400,
          message: "请提供必填字段",
          data: null,
        });
      }

      const resume = await (Resume as Model<IResume>).create({
        userId: user.userId,
        fileUrl,
        fileName,
        education,
        workExperience,
        skills,
        jobId,
        status: "pending",
        submittedAt: new Date(),
      });

      return res.status(201).json({
        code: 201,
        message: "简历提交成功",
        data: resume,
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
