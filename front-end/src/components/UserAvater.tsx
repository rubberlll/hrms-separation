import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { App, Avatar, Space } from "antd";

const UserAvatar: React.FC = () => (
  <Space direction="vertical" size={16}>
    <Avatar size={36} icon={<UserOutlined />} />
  </Space>
);

export default UserAvatar;
