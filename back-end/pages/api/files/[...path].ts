import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  try {
    const { path: filePath } = req.query;

    // 确保 filePath 是字符串数组
    if (!Array.isArray(filePath)) {
      return res
        .status(400)
        .json({ code: 400, message: "无效的文件路径", data: null });
    }

    // 对路径中的每个部分进行URL解码，处理中文字符
    const decodedFilePath = filePath.map((part) => decodeURIComponent(part));

    // 构建完整的文件路径
    const fullPath = path.join(
      process.cwd(),
      "uploads",
      "files",
      ...decodedFilePath
    );

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      return res
        .status(404)
        .json({ code: 404, message: "文件未找到", data: null });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(fullPath);

    // 设置适当的内容类型
    if (fullPath.toLowerCase().endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    } else if (
      fullPath.toLowerCase().endsWith(".jpg") ||
      fullPath.toLowerCase().endsWith(".jpeg")
    ) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (fullPath.toLowerCase().endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    } else if (
      fullPath.toLowerCase().endsWith(".doc") ||
      fullPath.toLowerCase().endsWith(".docx")
    ) {
      res.setHeader("Content-Type", "application/msword");
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }

    // 设置文件名 - 使用原始文件名并确保正确编码
    const fileName = decodedFilePath[decodedFilePath.length - 1];
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );

    // 发送文件
    res.send(fileBuffer);
  } catch (error) {
    console.error("文件访问错误:", error);
    res.status(500).json({ code: 500, message: "服务器错误", data: null });
  }
}
