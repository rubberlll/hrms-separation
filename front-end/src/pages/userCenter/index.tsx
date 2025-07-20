import React, { useState } from "react";
import "./index.less";
import { Avatar, Button, Tabs, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useLoginStore } from "../../store/useLoginStore";
import UserProfileDrawer from "../../components/UserProfileDrawer";

const roleColor = (role: string) => {
  if (role === "admin") return "red";
  if (role === "hr" || role === "employee") return "orange";
  return "blue";
};

const UserCenter: React.FC = () => {
  const userInfo = useLoginStore((state) => state.userInfo);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="ucenter-root">
      {/* <div className="ucenter-header-bg" /> */}
      <div className="ucenter-profile-card" style={{ marginTop: 0 }}>
        <Avatar
          size={96}
          src={userInfo?.avatar}
          style={{ background: "#eee" }}
        />
        <div className="ucenter-profile-info">
          <div className="ucenter-nickname">
            {userInfo?.username || "未登录"}
            <Tag color={roleColor(userInfo?.role || "")}>
              {userInfo?.role || "未知"}
            </Tag>
          </div>
          <div className="ucenter-auth">
            <span className="ucenter-auth-status">ID: {userInfo?.userId}</span>
          </div>
          <div className="ucenter-base-tags">
            {userInfo?.school && <Tag>{userInfo.school}</Tag>}
            {userInfo?.graduationYear && <Tag>{userInfo.graduationYear}</Tag>}
            {userInfo?.jobIntention && <Tag>{userInfo.jobIntention}</Tag>}
            {userInfo?.location && <Tag>{userInfo.location}</Tag>}
          </div>
          <div className="ucenter-bio">
            {userInfo?.bio ? (
              <>
                {userInfo.bio}
                <EditOutlined
                  style={{ marginLeft: 8, cursor: "pointer" }}
                  onClick={() => setDrawerOpen(true)}
                />
              </>
            ) : (
              <>
                点击添加简介，让大家认识你
                <EditOutlined
                  style={{ marginLeft: 8, cursor: "pointer" }}
                  onClick={() => setDrawerOpen(true)}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <UserProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userInfo={userInfo}
      />
      {/* Tab区块 */}
      <div className="ucenter-tabs-card">
        <Tabs
          defaultActiveKey="1"
          items={[
            { key: "1", label: "发布(3)", children: <div>发布内容区</div> },
            { key: "2", label: "评论(2)", children: <div>评论内容区</div> },
            { key: "3", label: "投递记录", children: <div>投递记录区</div> },
            { key: "4", label: "刷题", children: <div>刷题区</div> },
            { key: "5", label: "收藏", children: <div>收藏区</div> },
          ]}
        />
      </div>
      {/* 右侧卡片区可后续补充 */}
    </div>
  );
};

export default UserCenter;
