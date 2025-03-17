import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useLoginStore } from "../../store/useLoginStore";
import "./home.less";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Breadcrumb, Tag } from "antd";
import UserDropdown from "../../components/UserDropdown";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import CustomBreadcrumb from "../../components/CustomBreadcrumb";

const { Header, Sider, Content } = Layout;

// 添加可拖拽的菜单项组件
const DraggableMenuItem = ({
  item,
  index,
  moveItem,
}: {
  item: string;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
}) => {
  const [, drag] = useDrag({
    type: "MENU_ITEM",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "MENU_ITEM",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  // 修复ref的用法
  const ref = (node: HTMLDivElement) => {
    drag(node);
    drop(node);
  };

  return <div ref={ref}>{item}</div>;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useLoginStore();
  const [collapsed, setCollapsed] = useState(false);
  const [visitedTags, setVisitedTags] = useState<
    Array<{
      path: string;
      label: string;
    }>
  >([{ path: "/", label: "首页" }]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [menuItems, setMenuItems] = useState([
    {
      key: "1",
      icon: <UserOutlined />,
      label: "首页",
      onClick: () => {
        navigate("/");
        addVisitedTag("/", "首页");
      },
    },
    {
      key: "2",
      icon: <VideoCameraOutlined />,
      label: "员工管理",
      onClick: () => {
        navigate("/user");
        addVisitedTag("/user", "员工管理");
      },
    },
    {
      key: "3",
      icon: <UploadOutlined />,
      label: "招聘管理",
      children: [
        {
          key: "3-1",
          label: "简历查看",
          onClick: () => {
            navigate("/recruitment/resume");
            addVisitedTag("/recruitment/resume", "简历查看");
          },
        },
        {
          key: "3-2",
          label: "职位发布",
          onClick: () => {
            navigate("/recruitment/jobs");
            addVisitedTag("/recruitment/jobs", "职位发布");
          },
        },
        {
          key: "3-3",
          label: "申请职位",
          onClick: () => {
            navigate("/recruitment/apply");
            addVisitedTag("/recruitment/apply", "申请职位");
          },
        },
        {
          key: "3-4",
          label: "我的申请",
          onClick: () => {
            navigate("/recruitment/my-applications");
            addVisitedTag("/recruitment/my-applications", "我的申请");
          },
        },
      ],
    },
    {
      key: "4",
      icon: <UserOutlined />,
      label: "权限管理",
      onClick: () => {
        navigate("/permission-management");
        addVisitedTag("/permission-management", "权限管理");
      },
    },
    {
      key: "5",
      icon: <TeamOutlined />,
      label: "部门管理",
      onClick: () => {
        navigate("/department");
        addVisitedTag("/department", "部门管理");
      },
    },
  ]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    setMenuItems((prevItems) => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  };

  // 添加访问标签
  const addVisitedTag = (path: string, label: string) => {
    setVisitedTags((prev) => {
      if (!prev.find((tag) => tag.path === path)) {
        return [...prev, { path, label }];
      }
      return prev;
    });
  };

  // 删除标签
  const removeVisitedTag = (path: string) => {
    setVisitedTags((prev) => prev.filter((tag) => tag.path !== path));
  };

  // 保留路由映射表
  const routeMap = {
    "/": "首页",
    "/user": "员工管理",
    "/recruitment": "招聘管理",
    "/recruitment/resume": "简历查看",
    "/recruitment/jobs": "职位发布",
    "/recruitment/apply": "申请职位",
    "/recruitment/my-applications": "我的申请",
    "/permission-management": "权限管理",
    "/department": "部门管理",
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ minHeight: "100vh" }}
        >
          <div className="demo-logo-vertical" />
          <h2
            style={{ textAlign: "center", marginTop: "10px", color: "white" }}
          >
            HRM系统
          </h2>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems.map((item, index) => ({
              ...item,
              label: (
                <DraggableMenuItem
                  item={item.label}
                  index={index}
                  moveItem={moveItem}
                />
              ),
            }))}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
              <CustomBreadcrumb routeMap={routeMap} />
            </div>
            <UserDropdown />
          </Header>
          <div
            style={{
              padding: "8px 16px",
              background: colorBgContainer,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {visitedTags.map((tag) => (
              <Tag
                key={tag.path}
                closable={tag.path !== "/"}
                style={{ marginRight: 8, cursor: "pointer" }}
                onClick={() => navigate(tag.path)}
                onClose={(e) => {
                  e.preventDefault();
                  removeVisitedTag(tag.path);
                }}
              >
                {tag.label}
              </Tag>
            ))}
          </div>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </DndProvider>
  );
};

export default Home;
