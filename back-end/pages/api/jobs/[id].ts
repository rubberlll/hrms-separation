import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import Job from "../../../models/Job";
import { authMiddleware, roleCheck } from "../../../middleware/auth";
import { Model } from "mongoose";
import { IJob } from "../../../models/Job";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    await connectDB();

    if (req.method === "GET") {
      const job = await (Job as Model<IJob>)
        .findById(id)
        .populate("department", "name")
        .populate("createdBy", "username");

      if (!job) {
        return res.status(404).json({
          code: 404,
          message: "岗位不存在",
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "获取岗位详情成功",
        data: job,
      });
    }

    if (req.method === "PUT") {
      const {
        title,
        department,
        description,
        location,
        salaryRange,
        status,
        jobType,
        expiryDate,
      } = req.body;

      if (!title || !department || !description || !location || !status) {
        return res.status(400).json({
          code: 400,
          message: "请提供所有必填字段",
          data: null,
        });
      }

      const updatedJob = await (Job as Model<IJob>).findByIdAndUpdate(
        id,
        {
          title,
          department,
          description,
          location,
          salaryRange,
          status,
          jobType,
          expiryDate,
        },
        { new: true }
      );

      if (!updatedJob) {
        return res.status(404).json({
          code: 404,
          message: "岗位不存在",
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "更新岗位成功",
        data: updatedJob,
      });
    }

    if (req.method === "DELETE") {
      const deletedJob = await (Job as Model<IJob>).findByIdAndDelete(id);

      if (!deletedJob) {
        return res.status(404).json({
          code: 404,
          message: "岗位不存在",
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "删除岗位成功",
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

// 只有admin和hr可以修改和删除岗位
export default async function jobHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return handler(req, res);
  } else {
    return authMiddleware(roleCheck(["admin", "hr"])(handler))(req, res);
  }
}
