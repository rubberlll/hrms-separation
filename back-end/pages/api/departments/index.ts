import type { NextApiRequest, NextApiResponse } from "next";
import Department, { IDepartment } from "../../../models/Department";
import User from "../../../models/User";
import dbConnect from "../../../lib/mongodb";
import { authMiddleware, AuthenticatedRequest } from "../../../middleware/auth";
import { Model } from "mongoose";

// 不直接暴露handler函数，而是通过中间件包装它
const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        // 先获取所有部门
        const departments = await (Department as Model<IDepartment>)
          .find({})
          .populate("parentDepartment", "name")
          .lean();

        // 获取每个部门的员工数量
        const employeeCounts = await User.aggregate([
          {
            $match: { department: { $exists: true, $ne: null } },
          },
          {
            $group: {
              _id: "$department",
              count: { $sum: 1 },
            },
          },
        ]);

        // 将员工数量添加到部门数据中
        const departmentsWithCounts = departments.map((dept) => {
          const countInfo = employeeCounts.find(
            (count) => count._id.toString() === dept._id.toString()
          );
          return {
            ...dept,
            employeeCount: countInfo ? countInfo.count : 0,
          };
        });

        return res.status(200).json({
          code: 200,
          message: "获取部门列表成功",
          data: departmentsWithCounts,
        });
      } catch (error) {
        console.error("获取部门列表错误:", error);
        return res.status(500).json({
          code: 500,
          message: "获取部门列表失败",
          data: null,
        });
      }

    case "POST":
      try {
        const department = await (Department as Model<IDepartment>).create(
          req.body
        );
        return res.status(201).json({
          code: 201,
          message: "创建部门成功",
          data: department,
        });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({
            code: 400,
            message: "部门名称已存在",
            data: null,
          });
        }
        return res.status(500).json({
          code: 500,
          message: "创建部门失败",
          data: null,
        });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({
        code: 405,
        message: `方法 ${method} 不允许`,
        data: null,
      });
  }
};

// 使用中间件包装处理函数
export default authMiddleware(handler);
