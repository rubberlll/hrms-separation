import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";

interface Props {
  src?: string;
}

const UserAvatar: React.FC<Props> = ({ src }) => (
  <Avatar src={src} icon={!src && <UserOutlined />} />
);

export default UserAvatar;
