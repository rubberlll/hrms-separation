import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Resume from "../../../models/Resume";
import { authMiddleware } from "../../../middleware/auth";
import { Model } from "mongoose";
import { IResume } from "../../../models/Resume";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  try {
    await connectDB();

    const user = (req as any).user;

    const resumes = await (Resume as Model<IResume>)
      .find({
        userId: user.userId,
      })
      .populate("jobId", "title department")
      .sort({ submittedAt: -1 });

    // 格式化数据以适应前端组件
    const formattedApplications = resumes.map((resume) => ({
      key: resume._id,
      position: resume.jobId ? (resume.jobId as any).title : "未知职位",
      department: resume.jobId ? (resume.jobId as any).department : "",
      fileName: resume.fileName,
      submittedAt: resume.submittedAt.toISOString().split("T")[0],
      status: resume.status,
    }));

    return res.status(200).json({
      code: 200,
      message: "获取申请记录成功",
      data: formattedApplications,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "服务器错误", data: null });
  }
}

export default authMiddleware(handler);
