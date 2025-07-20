import React, { useState, useEffect } from "react";
import "./index.less";
import { Avatar, Button, Tabs, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useLoginStore } from "../../store/useLoginStore";
import UserProfileDrawer from "../../components/UserProfileDrawer";
import AvatarUpload from "../../components/AvatarUpload";
import request from "../../utils/request";
import PostCard from "../../components/PostCard";

const roleColor = (role: string) => {
  if (role === "admin") return "red";
  if (role === "hr" || role === "employee") return "orange";
  return "blue";
};

const UserCenter: React.FC = () => {
  const userInfo = useLoginStore((state) => state.userInfo);
  const setUserInfo = useLoginStore((state) => state.setUserInfo);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (userInfo?.userId) {
      request.get("/posts").then((res) => {
        if (res.data?.data) {
          setPosts(
            res.data.data.filter((p: any) => p.author?._id === userInfo.userId)
          );
        }
      });
    }
  }, [userInfo?.userId]);

  const handleAvatarUploadSuccess = async (avatarUrl: string) => {
    // 更新用户信息中的头像
    if (userInfo) {
      const updatedUserInfo = { ...userInfo, avatar: avatarUrl };
      setUserInfo(updatedUserInfo);

      // 同时更新后端数据库
      try {
        await fetch("/api/users/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userInfo.userId,
            avatar: avatarUrl,
          }),
        });
      } catch (error) {
        console.error("更新头像失败:", error);
      }
    }
  };

  return (
    <div className="ucenter-root">
      {/* <div className="ucenter-header-bg" /> */}
      <div className="ucenter-profile-card" style={{ marginTop: 0 }}>
        <AvatarUpload
          src={userInfo?.avatar}
          size={96}
          onUploadSuccess={handleAvatarUploadSuccess}
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
            {
              key: "1",
              label: `发布(${posts.length})`,
              children: (
                <div>
                  {posts.length === 0 ? (
                    <div
                      style={{
                        color: "#aaa",
                        textAlign: "center",
                        margin: "48px 0",
                      }}
                    >
                      暂无发布内容
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        userInfo={userInfo}
                      />
                    ))
                  )}
                </div>
              ),
            },
            { key: "2", label: "评论(0)", children: <div>评论内容区</div> },
            { key: "3", label: "收藏(0)", children: <div>收藏区</div> },
          ]}
        />
      </div>
    </div>
  );
};

export default UserCenter;
