import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  try {
    const { fileName, chunks } = req.body;

    if (!fileName || !chunks) {
      return res
        .status(400)
        .json({ code: 400, message: "参数不完整", data: null });
    }

    const tempDir = path.join(process.cwd(), "uploads", "temp", fileName);
    const uploadDir = path.join(process.cwd(), "uploads", "files");

    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 检查所有分片是否存在
    for (let i = 0; i < parseInt(chunks); i++) {
      const chunkPath = path.join(tempDir, `${i}`);
      if (!fs.existsSync(chunkPath)) {
        return res.status(400).json({
          code: 400,
          message: `分片 ${i} 缺失，合并失败`,
          data: null,
        });
      }
    }

    // 合并文件
    const filePath = path.join(uploadDir, fileName);
    const writeStream = fs.createWriteStream(filePath);

    for (let i = 0; i < parseInt(chunks); i++) {
      const chunkPath = path.join(tempDir, `${i}`);
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
      // 删除分片
      fs.unlinkSync(chunkPath);
    }

    writeStream.end();

    // 删除临时目录
    fs.rmdirSync(tempDir);

    // 生成文件URL (使用encodeURIComponent处理中文文件名)
    const encodedFileName = encodeURIComponent(fileName);
    const fileUrl = `/files/${encodedFileName}`;

    return res.status(200).json({
      code: 200,
      message: "文件合并成功",
      data: {
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: "服务器错误", data: null });
  }
}

export default authMiddleware(handler);
