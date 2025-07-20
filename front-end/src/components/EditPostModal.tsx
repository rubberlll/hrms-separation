import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import request from "../utils/request";

interface Props {
  open: boolean;
  onClose: () => void;
  post?: any;
  onSuccess?: () => void;
}

const EditPostModal: React.FC<Props> = ({ open, onClose, post, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  useEffect(() => {
    if (open && post) {
      // 先重置再设置，防止脏数据
      form.resetFields();
    }
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      setLoading(true);
      await request.put(`/posts/${post._id}`, {
        ...values,
        visibility,
      });
      message.success("编辑成功");
      onClose();
      onSuccess?.();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑帖子"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="保存"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: "请输入标题" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: "请输入内容" }]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>
        <Form.Item label="可见性" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <Button
              type={visibility === "public" ? "primary" : "default"}
              onClick={() => setVisibility("public")}
            >
              公开
            </Button>
            <Button
              type={visibility === "private" ? "primary" : "default"}
              onClick={() => setVisibility("private")}
            >
              仅自己可见
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPostModal;
