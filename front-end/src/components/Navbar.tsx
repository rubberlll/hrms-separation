import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import UserDropdown from "./UserDropdown/index";
import logo from "../assets/images/logo1.png";
import {
  UserOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const navMenus = [
  { key: "/", label: "首页" },
  { key: "/recruitment/jobs", label: "岗位投递" },
  { key: "/recruitment/my-applications", label: "我的投递" },
  { key: "/recruitment/resume", label: "简历制作" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: 72,
        background: "#fff",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
        padding: "0 32px",
        boxSizing: "border-box",
      }}
    >
      {/* 左侧Logo+HRMS+菜单 */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="logo" style={{ height: 48, marginLeft: 128 }} />
          <span
            style={{
              color: "#ff7a00",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 2,
              marginRight: 32,
            }}
          >
            HRMS招聘
          </span>
        </div>
        {/* 菜单项 */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navMenus.map((item) => (
            <span
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: location.pathname === item.key ? "#ff7a00" : "#222",
                cursor: "pointer",
                borderBottom:
                  location.pathname === item.key
                    ? "2.5px solid #ff7a00"
                    : "2.5px solid transparent",
                padding: "4px 0",
                transition: "color 0.2s, border-bottom 0.2s",
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
        {/* 搜索框 */}
        <div style={{ marginLeft: 32, display: "flex", alignItems: "center" }}>
          <Input
            placeholder="搜索职位、公司..."
            style={{
              width: 260,
              borderRadius: 4,
              border: "1px solid #e8e8e8",
              borderRight: "none",
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              height: 40,
            }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            style={{
              borderRadius: 4,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              border: "1px solid #e8e8e8",
              borderLeft: "none",
              background: "#fff",
              color: "#333",
              height: 40,
              width: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.color = "#333";
              e.currentTarget.style.borderColor = "#d9d9d9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#333";
              e.currentTarget.style.borderColor = "#e8e8e8";
            }}
            onClick={() => {
              // 这里添加搜索逻辑
              console.log("搜索触发");
            }}
          />
          {/* UserDropdown */}
          <div
            style={{ marginLeft: 32, display: "flex", alignItems: "center" }}
          >
            <UserDropdown />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginLeft: 32,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "#222",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/user")}
              >
                <UserOutlined
                  style={{ fontSize: 22, marginBottom: 2, color: "#222" }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#222" }}>
                  个人中心
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "#222",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/post/manage")}
              >
                <FileTextOutlined
                  style={{ fontSize: 22, marginBottom: 2, color: "#222" }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#222" }}>
                  投稿管理
                </span>
              </div>
              <Button
                type="primary"
                icon={<UploadOutlined style={{ fontSize: 20 }} />}
                style={{
                  background: "#ff7a00",
                  borderColor: "#ff7a00",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 8,
                  padding: "0 16px",
                  height: 40,
                  marginLeft: 8,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#ff9100")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#ff7a00")
                }
                onClick={() => navigate("/post/create")}
              >
                发布
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
