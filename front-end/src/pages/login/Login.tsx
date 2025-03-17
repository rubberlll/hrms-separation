import React, { useState } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, Card, message, Tabs } from "antd";
import "./login.less";
import { useNavigate } from "react-router-dom";
// 修改图片导入方式为 require 方式
const navigatingImage = require("@/assets/images/Navigating.jpg");
import { useLoginStore } from "@/store/useLoginStore";
import request from "@/utils/request";
import { CheckCircleOutlined } from "@ant-design/icons";

type FieldType = {
  username: string;
  password: string;
  remember?: string;
};

type RegisterFieldType = {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setLogin } = useLoginStore();
  const [activeTab, setActiveTab] = useState("login");
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const result = await setLogin({
      username: values.username,
      password: values.password,
    });

    if (result.success) {
      navigate("/");
    } else {
      // 显示错误信息
      messageApi.error(result.message || "登录失败");
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

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
        setActiveTab("login");
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
    <div className="loginContainer">
      {contextHolder}
      <Card
        style={{ width: 500 }}
        cover={<img alt="navigating" src={navigatingImage} />}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "login",
              label: "登录",
              children: (
                <Form
                  name="basic"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                  style={{ maxWidth: 800 }}
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                >
                  <Form.Item<FieldType>
                    label="用户名"
                    name="username"
                    rules={[{ required: true, message: "请输入用户名" }]}
                    className="loginForm"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item<FieldType>
                    label="密码"
                    name="password"
                    rules={[{ required: true, message: "请输入密码" }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item<FieldType>
                    name="remember"
                    valuePropName="checked"
                    wrapperCol={{ offset: 6, span: 14 }}
                    label={null}
                  >
                    <Checkbox>记住密码</Checkbox>
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 10, span: 3 }} label={null}>
                    <Button type="primary" htmlType="submit">
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "register",
              label: "注册",
              children: (
                <Form
                  name="register"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                  style={{ maxWidth: 800 }}
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
                    <Input />
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
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[
                      { required: true, message: "请输入密码" },
                      { min: 6, message: "密码至少6个字符" },
                    ]}
                  >
                    <Input.Password />
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
                          return Promise.reject(
                            new Error("两次输入的密码不一致")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 10, span: 3 }} label={null}>
                    <Button type="primary" htmlType="submit">
                      注册
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
