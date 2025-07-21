import React, { useState } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, Card, message, Tabs } from "antd";
import "./login.less";
import { useNavigate } from "react-router-dom";
import { useLoginStore } from "../../store/useLoginStore";
import request from "../../utils/request";
import { CheckCircleOutlined } from "@ant-design/icons";
import tabLeft from "../../assets/images/tabLeft.png";
import tabRight from "../../assets/images/tabRight.png";
import { UserOutlined, HomeOutlined, LockOutlined } from "@ant-design/icons";
import jobFinder from "../../assets/images/jobFinder.png";
import recruiterFinder from "../../assets/images/recruiterFinder.png";
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
  const [role, setRole] = useState<"jobseeker" | "recruiter">("jobseeker");

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const result = await setLogin({
      username: values.username,
      password: values.password,
    });

    if (result.success) {
      if (role === "jobseeker") {
        navigate("/");
      } else {
        navigate("/admin");
      }
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
      <Card>
        <div className="loginTopSwitch">
          <div
            className={role === "jobseeker" ? "activeLeft" : ""}
            onClick={() => setRole("jobseeker")}
            style={
              role === "jobseeker"
                ? {
                    backgroundImage: `url(${tabLeft})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }
                : {}
            }
          >
            <UserOutlined />
            我是求职者
          </div>
          <div
            className={role === "recruiter" ? "activeRight" : ""}
            onClick={() => setRole("recruiter")}
            style={
              role === "recruiter"
                ? {
                    backgroundImage: `url(${tabRight})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }
                : {}
            }
          >
            <HomeOutlined />
            我是招聘方
          </div>
        </div>
        <div className="loginMainContent">
          <Card>
            <div className="loginLeftForm ">
              <Form
                name="basic"
                layout="vertical"
                style={{ width: 400, maxWidth: "100%" }}
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
                  <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item<FieldType>
                  label="密码"
                  name="password"
                  rules={[{ required: true, message: "请输入密码" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                  />
                </Form.Item>
                <Form.Item<FieldType>
                  name="remember"
                  valuePropName="checked"
                  label={null}
                  style={{ textAlign: "left", marginBottom: 0 }}
                >
                  <Checkbox>记住密码</Checkbox>
                </Form.Item>
                <Form.Item label={null} style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      width: "100%",
                      background: "#FF7F22",
                      borderRadius: 8,
                      fontWeight: "bold",
                      fontSize: 16,
                      border: "none",
                    }}
                  >
                    登录
                  </Button>
                </Form.Item>
                <Form.Item label={null} style={{ marginBottom: 0 }}>
                  <div className="loginBottomTip">
                    <div>忘记密码？</div>
                    <div>
                      还没有账户？
                      <span
                        className="register-link"
                        onClick={() => navigate("/register")}
                      >
                        立即注册
                      </span>
                    </div>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </Card>
          <div className="loginRightImg">
            <img
              src={role === "jobseeker" ? jobFinder : recruiterFinder}
              alt="二维码"
              className="qrImg"
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
