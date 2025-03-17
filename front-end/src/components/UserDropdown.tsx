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

  return (
    <>
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>
          <Space>
            <UserAvatar />
            <span>{username || "用户"}</span>
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>

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
