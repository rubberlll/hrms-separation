import React, { useState } from "react";
import { Avatar, Upload, Modal, message } from "antd";
import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import "./index.less";

interface Props {
  src?: string;
  size?: number;
  onUploadSuccess?: (url: string) => void;
}

const AvatarUpload: React.FC<Props> = ({ src, size = 96, onUploadSuccess }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        message.success("头像上传成功");
        onUploadSuccess?.(result.url);
        setUploadModalVisible(false);
      } else {
        message.error("上传失败");
      }
    } catch (error) {
      message.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("只能上传 JPG/PNG 格式的图片!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("图片大小不能超过 2MB!");
        return false;
      }
      handleUpload(file);
      return false; // 阻止默认上传行为
    },
  };

  return (
    <>
      <div
        className="avatar-upload-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setUploadModalVisible(true)}
      >
        <Avatar
          size={size}
          src={src}
          icon={<UserOutlined />}
          style={{ background: "#eee" }}
        />
        {isHovered && (
          <div className="avatar-upload-overlay">
            <CameraOutlined className="camera-icon" />
          </div>
        )}
      </div>

      <Modal
        title="上传头像"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        confirmLoading={uploading}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Upload {...uploadProps}>
            <div className="upload-area">
              <CameraOutlined style={{ fontSize: 48, color: "#999" }} />
              <div style={{ marginTop: 8 }}>点击上传头像</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                支持 JPG/PNG 格式，文件大小不超过 2MB
              </div>
            </div>
          </Upload>
        </div>
      </Modal>
    </>
  );
};

export default AvatarUpload;
