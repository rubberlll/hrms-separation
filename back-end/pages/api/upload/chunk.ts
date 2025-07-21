import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../../../middleware/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormidableFile {
  filepath: string;
  path?: string;
  size: number;
  name: string;
  type: string;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ code: 405, message: "方法不允许", data: null });
  }

  try {
    const uploadDir = path.join(process.cwd(), "uploads", "temp");
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 修改formidable配置
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: false,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      filter: ({ mimetype }) => {
        return mimetype === "application/pdf";
      },
    });

    return new Promise<void>((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("解析表单错误:", err);
          res.status(500).json({ code: 500, message: "上传失败", data: null });
          return resolve();
        }

        try {
          // 检查文件和字段是否存在
          const file =
            files.file?.[0] || (files.file as unknown as FormidableFile);
          const fileName = Array.isArray(fields.fileName)
            ? fields.fileName[0]
            : fields.fileName;
          const chunkIndex = Array.isArray(fields.chunkIndex)
            ? fields.chunkIndex[0]
            : fields.chunkIndex;
          const chunks = Array.isArray(fields.chunks)
            ? fields.chunks[0]
            : fields.chunks;

          if (!file || !fileName || chunkIndex === undefined || !chunks) {
            console.error("参数不完整:", {
              file: !!file,
              fileName: !!fileName,
              chunkIndex,
              chunks,
            });
            res
              .status(400)
              .json({ code: 400, message: "参数不完整", data: null });
            return resolve();
          }

          // 创建以文件名命名的临时文件夹存储分片
          const fileDir = path.join(uploadDir, fileName);
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }

          // 获取正确的文件路径
          const filePath = file.filepath;

          if (!filePath) {
            console.error("无法获取文件路径:", file);
            res
              .status(500)
              .json({ code: 500, message: "无法获取文件路径", data: null });
            return resolve();
          }

          // 保存分片到对应的文件夹
          const chunkPath = path.join(fileDir, `${chunkIndex}`);
          fs.renameSync(filePath, chunkPath);

          res.status(200).json({
            code: 200,
            message: "分片上传成功",
            data: { chunkIndex, totalChunks: chunks },
          });
          return resolve();
        } catch (error) {
          console.error("处理分片错误:", error);
          res
            .status(500)
            .json({ code: 500, message: "处理分片失败", data: null });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error("服务器错误:", error);
    return res
      .status(500)
      .json({ code: 500, message: "服务器错误", data: null });
  }
}

export default authMiddleware(handler);
