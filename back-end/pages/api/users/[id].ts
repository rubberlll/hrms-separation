import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import { authMiddleware, roleCheck } from "../../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      await connectDB();

      const user = await User.findById(id)
        .select("-password")
        .populate("department", "name");

      if (!user) {
        return res
          .status(404)
          .json({ code: 404, message: "用户不存在", data: null });
      }

      const formattedUser = {
        key: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: user.status,
        department: user.department ? (user.department as any).name : "",
        departmentId: user.department || "",
        entryDate: user.entryDate
          ? new Date(user.entryDate).toISOString().split("T")[0]
          : "",
        employmentType: user.employmentType || "",
        avatar: user.avatar || "",
        createdAt: user.createdAt,
      };

      return res.status(200).json({
        code: 200,
        message: "获取用户详情成功",
        data: formattedUser,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ code: 500, message: "服务器错误", data: null });
    }
  } else if (req.method === "PUT") {
    try {
      await connectDB();

      const updateData = req.body;
      // 防止修改敏感字段
      delete updateData.password;

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ code: 404, message: "用户不存在", data: null });
      }

      return res.status(200).json({
        code: 200,
        message: "更新用户信息成功",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ code: 500, message: "服务器错误", data: null });
    }
  } else if (req.method === "DELETE") {
    try {
      await connectDB();

      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res
          .status(404)
          .json({ code: 404, message: "用户不存在", data: null });
      }

      return res.status(200).json({
        code: 200,
        message: "删除用户成功",
        data: null,
      });
    } catch (error) {
      console.error(error);
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

// 只有管理员和HR可以操作用户信息
export default authMiddleware(roleCheck(["admin", "hr"])(handler));
