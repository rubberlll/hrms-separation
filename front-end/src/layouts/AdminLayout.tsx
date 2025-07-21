import React from "react";
import { Layout, Menu, Avatar, Input, Dropdown } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  SettingOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import logo from "../assets/images/logo1.png";
import "./AdminLayout.less";
import { useNavigate, useLocation } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useLoginStore } from "../store/useLoginStore";
import AdminUserDropdown from "../components/AdminUserDropdown";

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: "/admin", icon: <HomeOutlined />, label: "仪表板" },
  { key: "/admin/jobs", icon: <BankOutlined />, label: "职位管理" },
  { key: "/admin/candidates", icon: <TeamOutlined />, label: "候选人管理" },
  { key: "/admin/departments", icon: <ApartmentOutlined />, label: "部门管理" },
  {
    key: "/admin/setting",
    icon: <SettingOutlined />,
    label: "账户设置",
  },
  {
    key: "/admin/permission-management",
    icon: <SettingOutlined />,
    label: "系统管理",
  },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { logout, userInfo } = useLoginStore();

  const menu = (
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
          style={{ background: "#ffe0b2", color: "#ff7a00", fontSize: 28 }}
          icon={<UserOutlined />}
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
        >
          账户设置
        </Menu.Item>
        <Menu.Item
          key="theme"
          icon={
            <span className="anticon">
              <svg
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a1 1 0 0 1 1 1v1.07A7.001 7.001 0 0 1 19.93 11H21a1 1 0 1 1 0 2h-1.07A7.001 7.001 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A7.001 7.001 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A7.001 7.001 0 0 1 11 4.07V3a1 1 0 0 1 1-1zm1 9a5 5 0 1 0-4 0 5 5 0 0 0 4 0z" />
              </svg>
            </span>
          }
          onClick={toggleTheme}
          className="admin-dropdown-item"
          style={{ paddingLeft: 24 }}
        >
          切换为{isDarkMode ? "浅色" : "深色"}主题
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="logout"
          style={{ color: "#ff4d4f", fontWeight: "bold", paddingLeft: 24 }}
          icon={
            <span className="anticon">
              <svg
                width="1em"
                height="1em"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
              </svg>
            </span>
          }
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

  return (
    <Layout className="admin-layout">
      <Sider width={240} className="admin-sider">
        <div className="admin-logo">
          <img
            src={logo}
            alt="logo"
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
          <div className="admin-title">
            招聘管理
            <br />
            <span>后台系统</span>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[
            location.pathname.startsWith("/admin")
              ? location.pathname
              : "/admin",
          ]}
          style={{ borderRight: 0, marginTop: 24 }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          className="admin-header"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div className="admin-header-actions">
            <Dropdown
              overlay={
                <AdminUserDropdown
                  userInfo={userInfo}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  logout={logout}
                />
              }
              placement="bottomLeft"
              trigger={["hover"]}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  src={userInfo?.avatar}
                  style={{
                    background: userInfo?.avatar ? undefined : "#ffe0b2",
                    color: userInfo?.avatar ? undefined : "#ff7a00",
                  }}
                  icon={!userInfo?.avatar && <UserOutlined />}
                />
                <span
                  className="admin-header-username"
                  style={{ marginLeft: 8, fontWeight: "bold" }}
                >
                  {userInfo?.username || "管理员"}
                </span>
              </span>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
