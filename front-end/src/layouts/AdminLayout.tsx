import React from "react";
import { Layout, Menu, Avatar, Input, Dropdown } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import logo from "../assets/images/logo1.png";
import "./AdminLayout.less";
import { useNavigate, useLocation } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useLoginStore } from "../store/useLoginStore";

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: "/admin", icon: <HomeOutlined />, label: "仪表板" },
  { key: "/admin/jobs", icon: <BankOutlined />, label: "职位管理" },
  { key: "/admin/candidates", icon: <TeamOutlined />, label: "候选人管理" },
  { key: "/admin/companies", icon: <UserOutlined />, label: "企业管理" },
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
    <Menu>
      <Menu.Item key="theme" onClick={toggleTheme}>
        切换为{isDarkMode ? "浅色" : "深色"}主题
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
      >
        退出登录
      </Menu.Item>
    </Menu>
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
        <Header className="admin-header">
          <div className="admin-header-search">
            <Input
              placeholder="搜索职位、候选人..."
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              className="admin-header-search-input"
            />
          </div>
          <div className="admin-header-actions">
            <Dropdown
              overlay={menu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  style={{ background: "#ffe0b2", color: "#ff7a00" }}
                  icon={<UserOutlined />}
                />
                <span
                  className="admin-header-username"
                  style={{ marginLeft: 8 }}
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
