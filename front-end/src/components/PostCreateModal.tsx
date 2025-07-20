import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import request from "../utils/request";
import { useLoginStore } from "../store/useLoginStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PostCreateModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const userInfo = useLoginStore((state) => state.userInfo);
  const [visibility, setVisibility] = React.useState<"public" | "private">(
    "public"
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await request.post("/posts", {
        ...values,
        author: userInfo?.userId,
        visibility,
      });
      message.success("发帖成功");
      form.resetFields();
      setVisibility("public");
      onClose();
      onSuccess?.();
    } catch (e) {
      // 校验失败或请求失败
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="发布新帖子"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="发布"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: "请输入标题" }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: "请输入内容" }]}
        >
          <Input.TextArea rows={6} placeholder="请输入内容" />
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

export default PostCreateModal;
