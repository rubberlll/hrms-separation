import type { NextApiRequest, NextApiResponse } from "next";
import Department from "../../../models/Department";
import dbConnect from "../../../lib/mongodb";
import { authMiddleware } from "../../../middleware/auth";
import mongoose from "mongoose";
import { Model } from "mongoose";
import { IDepartment } from "../../../models/Department";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    method,
    query: { id },
  } = req;

  // 验证token - 修正调用方式
  try {
    // 直接调用authMiddleware并传入一个处理函数
    const authenticatedHandler = authMiddleware((req, res) => {
      // 处理函数内部不需要做任何事情，因为验证已在中间件中完成
      return Promise.resolve();
    });
    await authenticatedHandler(req, res);
  } catch (error) {
    return res.status(401).json({ code: 401, message: "未授权", data: null });
  }

  // 验证ID格式
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({
      code: 400,
      message: "无效的部门ID",
      data: null,
    });
  }

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const department = await (Department as Model<IDepartment>)
          .findById(id)
          .populate("manager", "name email")
          .populate("parentDepartment", "name");

        if (!department) {
          return res.status(404).json({
            code: 404,
            message: "部门不存在",
            data: null,
          });
        }

        return res.status(200).json({
          code: 200,
          message: "获取部门详情成功",
          data: department,
        });
      } catch (error) {
        return res.status(500).json({
          code: 500,
          message: "获取部门详情失败",
          data: null,
        });
      }

    case "PUT":
      try {
        const department = await (
          Department as Model<IDepartment>
        ).findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!department) {
          return res.status(404).json({
            code: 404,
            message: "部门不存在",
            data: null,
          });
        }

        return res.status(200).json({
          code: 200,
          message: "更新部门成功",
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
          message: "更新部门失败",
          data: null,
        });
      }

    case "DELETE":
      try {
        const departmentId = id as string;

        // 直接删除并获取结果
        const result = await (Department as Model<IDepartment>).deleteOne({
          _id: departmentId,
        });

        // 检查是否有文档被删除
        if (result.deletedCount === 0) {
          return res.status(404).json({
            code: 404,
            message: "部门不存在",
            data: null,
          });
        }

        return res.status(200).json({
          code: 200,
          message: "删除部门成功",
          data: null,
        });
      } catch (error) {
        return res.status(500).json({
          code: 500,
          message: "删除部门失败",
          data: null,
        });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({
        code: 405,
        message: `方法 ${method} 不允许`,
        data: null,
      });
  }
}

// <think>
// 这段文字是 TypeScript 的类型错误信息，我将进行翻译。这里指的是一个表达式不可调用，并且解释了原因是联合类型中的每个成员都有签名，但这些签名彼此不兼容。

// 我需要将这个技术错误信息翻译成中文，保持原始含义。
// </think>

// # TypeScript错误信息翻译

// ```
// 此表达式不可调用。
//   联合类型'{ <ResultDoc = Document<unknown, {}, IDepartment> & IDepartment & Required<{ _id: unknown; }> & { __v: number; }>(id: any, projection: ProjectionType<IDepartment>, options: QueryOptions<...> & { ...; }): Query<...>; <ResultDoc = Document<...> & ... 2 more ... & { ...; }>(id: any, projection?: ProjectionType<...>, op...'的每个成员都有签名，但这些签名彼此不兼容。ts(2349)
// ```
