import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { authMiddleware } from "../../../middleware/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  try {
    const { fileName, chunks } = req.body;
    console.log("开始合并文件:", { fileName, chunks });

    if (!fileName || !chunks) {
      return res
        .status(400)
        .json({ code: 400, message: "参数不完整", data: null });
    }

    // 确保临时目录存在
    const baseDir = path.join(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const tempDir = path.join(baseDir, fileName);
    const tempFilePath = path.join(baseDir, `merged_${fileName}`);

    console.log("检查目录:", {
      baseDir: fs.existsSync(baseDir),
      tempDir: fs.existsSync(tempDir),
    });

    // 检查所有分片是否存在
    for (let i = 0; i < parseInt(chunks); i++) {
      const chunkPath = path.join(tempDir, `${i}`);
      if (!fs.existsSync(chunkPath)) {
        console.error(`分片 ${i} 不存在:`, chunkPath);
        return res.status(400).json({
          code: 400,
          message: `分片 ${i} 缺失，合并失败`,
          data: null,
        });
      }
    }

    console.log("所有分片检查完成，开始合并");

    try {
      // 合并文件到临时文件
      const writeStream = fs.createWriteStream(tempFilePath);

      for (let i = 0; i < parseInt(chunks); i++) {
        const chunkPath = path.join(tempDir, `${i}`);
        console.log(`正在处理分片 ${i}:`, chunkPath);
        const chunkData = fs.readFileSync(chunkPath);
        writeStream.write(chunkData);
        // 删除分片
        fs.unlinkSync(chunkPath);
      }

      writeStream.end();
      // 等待写入完成
      await new Promise<void>((resolve) =>
        writeStream.on("finish", () => resolve())
      );
      console.log("文件合并完成");

      // 删除临时目录
      fs.rmdirSync(tempDir);
      console.log("临时目录删除成功");

      // 读取合并后的文件
      const fileBuffer = fs.readFileSync(tempFilePath);
      console.log("合并文件读取成功，大小:", fileBuffer.length);

      // 生成唯一的文件名
      const uniqueFileName = `resume_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.pdf`;

      console.log("开始上传到 Vercel Blob");
      // 上传到 Vercel Blob Storage
      const { url } = await put(uniqueFileName, fileBuffer, {
        access: "public",
        contentType: "application/pdf",
      });
      console.log("Vercel Blob 上传成功:", url);

      // 删除临时合并文件
      fs.unlinkSync(tempFilePath);
      console.log("临时合并文件删除成功");

      return res.status(200).json({
        code: 200,
        message: "文件合并成功",
        data: {
          url,
          fileName: uniqueFileName,
        },
      });
    } catch (mergeError) {
      console.error("文件合并过程错误:", mergeError);
      throw mergeError;
    }
  } catch (error) {
    console.error("合并文件错误:", error);
    if (error instanceof Error) {
      return res.status(500).json({
        code: 500,
        message: `服务器错误: ${error.message}`,
        data: null,
      });
    }
    return res
      .status(500)
      .json({ code: 500, message: "服务器错误", data: null });
  }
}

export default authMiddleware(handler);
