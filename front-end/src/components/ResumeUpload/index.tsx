import React from "react";
import { Form, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import "./index.less";

const { Dragger } = Upload;

const ResumeUpload: React.FC = () => {
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file: File) => {
    const isPDF = file.type === "application/pdf";
    if (!isPDF) {
      message.error("只能上传 PDF 文件！");
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error("文件必须小于 20MB！");
    }
    return false;
  };

  return (
    <Form.Item
      label="上传简历"
      name="resume"
      rules={[{ required: true, message: "请上传您的简历" }]}
      valuePropName="fileList"
      getValueFromEvent={normFile}
    >
      <Dragger
        name="file"
        multiple={false}
        beforeUpload={beforeUpload}
        accept=".pdf"
        maxCount={1}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">支持PDF格式，文件大小不超过20MB</p>
      </Dragger>
    </Form.Item>
  );
};

export default ResumeUpload;
