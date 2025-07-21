import React from "react";
import { Button, Form, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import request from "../../utils/request";
import "./index.less";
import { useNavigate } from "react-router-dom";

type RegisterFieldType = {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // 注册表单提交处理
  const onRegisterFinish = async (values: RegisterFieldType) => {
    try {
      // 使用request工具发送注册请求
      const response = await request.post("/register", {
        username: values.username,
        password: values.password,
        email: values.email,
      });

      if (response.data.success) {
        messageApi.success("注册成功！请登录");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        messageApi.error(response.data.message || "注册失败");
      }
    } catch (error) {
      // 错误已经在request拦截器中处理
      console.error("注册错误:", error);
    }
  };

  const onRegisterFinishFailed = (errorInfo: any) => {
    console.log("注册失败:", errorInfo);
  };

  return (
    <div className="register-bg">
      {contextHolder}
      <div className="register-card">
        <div className="register-title">注册</div>
        <Form
          className="register-form"
          name="register"
          layout="vertical"
          onFinish={onRegisterFinish}
          onFinishFailed={onRegisterFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, message: "用户名至少3个字符" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "请输入有效的邮箱地址",
              },
            ]}
          >
            <Input prefix={<LockOutlined />} placeholder="请输入邮箱地址" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6个字符" },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              type="password"
            />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              type="password"
            />
          </Form.Item>
          <Form.Item label={null} style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit">
              注册
            </Button>
          </Form.Item>
        </Form>
        <div className="register-bottom-tip">
          已有账号？
          <span className="register-link" onClick={() => navigate("/login")}>
            立即登录
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
