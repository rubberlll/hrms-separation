import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import Department from "../../../models/Department";
import { authMiddleware, roleCheck } from "../../../middleware/auth";
import bcrypt from "bcryptjs";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      await connectDB();

      const users = await User.find({})
        .select("-password")
        .populate("department", "name");

      const formattedUsers = users.map((user) => ({
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
      }));

      return res.status(200).json({
        code: 200,
        message: "获取用户列表成功",
        data: formattedUsers,
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

      const { userId, password } = req.body;

      if (!userId || !password) {
        return res.status(400).json({
          code: 400,
          message: "用户ID和密码不能为空",
          data: null,
        });
      }

      // 生成密码的哈希值
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 更新用户密码
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在",
          data: null,
        });
      }

      return res.status(200).json({
        code: 200,
        message: "密码修改成功",
        data: updatedUser,
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

// 只有管理员和HR可以查看用户列表
export default authMiddleware(roleCheck(["admin", "hr"])(handler));
