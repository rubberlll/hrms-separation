import React from "react";
import { Menu, Avatar } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  BulbOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface AdminUserDropdownProps {
  userInfo: any;
  isDarkMode: boolean;
  toggleTheme: () => void;
  logout: () => void;
}

const AdminUserDropdown: React.FC<AdminUserDropdownProps> = ({
  userInfo,
  isDarkMode,
  toggleTheme,
  logout,
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="admin-dropdown-menu"
      style={{
        minWidth: 220,
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        background: "#fff",
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        className="admin-dropdown-header"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "20px 0 12px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Avatar
          size={48}
          src={userInfo?.avatar}
          style={{
            background: userInfo?.avatar ? undefined : "#ffe0b2",
            color: userInfo?.avatar ? undefined : "#ff7a00",
            fontSize: 28,
          }}
          icon={!userInfo?.avatar && <UserOutlined />}
        />
        <div className="admin-dropdown-header-info" style={{ marginLeft: 12 }}>
          <div style={{ fontWeight: "bold", fontSize: 18, color: "#222" }}>
            {userInfo?.username || "admin"}
          </div>
          <div style={{ color: "#888", fontSize: 14, marginTop: 2 }}>
            {userInfo?.roleName || "管理员"}
          </div>
        </div>
      </div>
      <Menu style={{ border: "none", boxShadow: "none", marginTop: 0 }}>
        <Menu.Item
          key="account"
          icon={<SettingOutlined />}
          className="admin-dropdown-item"
          style={{ paddingLeft: 24 }}
          onClick={() => navigate("/admin/setting")}
        >
          账户设置
        </Menu.Item>

        <Menu.Divider />
        <Menu.Item
          key="logout"
          style={{ color: "#ff4d4f", fontWeight: "bold", paddingLeft: 24 }}
          icon={<LogoutOutlined />}
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="admin-dropdown-item admin-dropdown-logout"
        >
          退出登录
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default AdminUserDropdown;
