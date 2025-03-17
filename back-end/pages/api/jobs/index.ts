import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Job from "../../../models/Job";
import { authMiddleware, roleCheck } from "../../../middleware/auth";
import { Model } from "mongoose";
import { IJob } from "../../../models/Job";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const jobs = await (Job as Model<IJob>)
        .find()
        .populate("department", "name")
        .populate("createdBy", "username")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        code: 200,
        message: "获取岗位列表成功",
        data: jobs,
      });
    }

    if (req.method === "POST") {
      const {
        title,
        department,
        description,
        location,
        salaryRange,
        jobType,
        expiryDate,
      } = req.body;

      if (!title || !department || !description || !location) {
        return res.status(400).json({
          code: 400,
          message: "请提供所有必填字段",
          data: null,
        });
      }

      const user = (req as any).user;

      const job = await (Job as Model<IJob>).create({
        title,
        department,
        description,
        location,
        salaryRange,
        jobType,
        expiryDate,
        status: "open",
        createdBy: user.userId,
      });

      return res.status(201).json({
        code: 201,
        message: "岗位发布成功",
        data: job,
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

// GET请求所有人可以访问，POST请求只有admin和hr可以使用
export default async function jobsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return handler(req, res);
  } else {
    return authMiddleware(roleCheck(["admin", "hr"])(handler))(req, res);
  }
}
