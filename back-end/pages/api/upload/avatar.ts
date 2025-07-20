import { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const form = formidable({
      maxFileSize: 2 * 1024 * 1024, // 2MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes("image");
      },
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "没有找到上传的文件",
      });
    }

    // 读取文件内容
    const fileBuffer = fs.readFileSync(file.filepath);

    // 生成唯一文件名
    const fileName = `avatar_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${file.originalFilename?.split(".").pop() || "jpg"}`;

    // 上传到 Vercel Blob Storage
    const { url } = await put(fileName, fileBuffer, {
      access: "public",
      contentType: file.mimetype || "image/jpeg",
    });

    // 删除临时文件
    fs.unlinkSync(file.filepath);

    res.status(200).json({
      success: true,
      url,
      message: "头像上传成功",
    });
  } catch (error) {
    console.error("头像上传错误:", error);
    res.status(500).json({
      success: false,
      message: "上传失败",
    });
  }
}

export default handler;
