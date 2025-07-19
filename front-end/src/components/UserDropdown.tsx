import React, { useEffect, useState } from "react";
import { DownOutlined, SettingOutlined } from "@ant-design/icons";
import type { App, MenuProps } from "antd";
import {
  Dropdown,
  Space,
  theme,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import UserAvatar from "./UserAvater";
import { useLoginStore } from "../store/useLoginStore";
import { useThemeStore } from "../store/useThemeStore";
import request from "../utils/request";

const UserDropdown: React.FC = () => {
  const logout = useLoginStore((state) => state.logout);
  const user = useLoginStore((state) => state.userInfo);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { token } = theme.useToken();
  const [username, setUsername] = useState<string>("");
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      // 当用户信息加载后，预填充表单
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        employmentType: user.employmentType || undefined,
        entryDate: user.entryDate ? new Date(user.entryDate) : undefined,
      });
    }
  }, [user, form]);

  const handleSettingsSave = async (values: any) => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      const response = await request.put(`/users/${user.userId}`, values);
      if (response.data.code === 200) {
        message.success("个人信息更新成功");
        setIsSettingsModalVisible(false);
        // 这里可以添加刷新用户信息的逻辑
      } else {
        message.error(response.data.message || "更新失败");
      }
    } catch (error) {
      console.error("更新个人信息失败:", error);
      message.error("更新个人信息失败");
    } finally {
      setLoading(false);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: `${username || "我"}的账户`,
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "退出登录",
      extra: "⌘P",
      onClick: () => {
        logout();
        // 可以在这里添加退出后的重定向逻辑，比如跳转到登录页
        window.location.href = "/login";
      },
    },
    {
      key: "3",
      label: "设置",
      icon: <SettingOutlined />,
      extra: "⌘S",
      onClick: () => setIsSettingsModalVisible(true),
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: `切换到${isDarkMode ? "浅色" : "深色"}主题`,
      onClick: () => {
        toggleTheme();
      },
    },
  ];

  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        style={{
          position: "relative",
          cursor: "pointer",
          transition: "transform 0.2s ease",
          display: "inline-block",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            transform: isHovered
              ? "scale(2) translate(-10px, 5px)"
              : "scale(1) translate(0, 0)",
            transition: "transform 0.2s ease",
            zIndex: isHovered ? 1001 : 1,
          }}
        >
          <UserAvatar />
        </div>

        {/* 自定义下拉卡片 */}
        {isHovered && (
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "-100px",
              width: "280px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              border: "1px solid #f0f0f0",
              zIndex: 1000,
              padding: "60px 20px 20px",
            }}
          >
            {/* 用户信息区域 */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {username || "用户"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "16px",
                }}
              >
                用户等级: LV1
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  fontSize: "14px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>0</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>关注</div>
                </div>
                <div>
                  <div style={{ fontWeight: "bold" }}>0</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>粉丝</div>
                </div>
                <div>
                  <div style={{ fontWeight: "bold" }}>0</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>动态</div>
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div>
              <div
                style={{
                  padding: "12px 0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#333",
                }}
                onClick={() => setIsSettingsModalVisible(true)}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <SettingOutlined style={{ marginRight: "8px" }} />
                  <span>设置</span>
                </div>
                <span style={{ fontSize: "12px", color: "#999" }}>⌘S</span>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "#f0f0f0",
                  margin: "8px 0",
                }}
              />

              <div
                style={{
                  padding: "12px 0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#333",
                }}
                onClick={() => toggleTheme()}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>切换到{isDarkMode ? "浅色" : "深色"}主题</span>
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "#f0f0f0",
                  margin: "8px 0",
                }}
              />

              <div
                style={{
                  padding: "12px 0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  color: "#333",
                }}
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>退出登录</span>
                </div>
                <span style={{ fontSize: "12px", color: "#999" }}>⌘P</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="个人设置"
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleSettingsSave}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话号码" />
          </Form.Item>

          <Form.Item name="employmentType" label="雇佣类型">
            <Select placeholder="请选择雇佣类型">
              <Select.Option value="全职">全职</Select.Option>
              <Select.Option value="兼职">兼职</Select.Option>
              <Select.Option value="实习">实习</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="entryDate" label="入职日期">
            <DatePicker
              placeholder="请选择入职日期"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserDropdown;
