import React, { useState, useEffect } from "react";
import "./index.less";
import { Avatar, Button, Tabs, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useLoginStore } from "../../store/useLoginStore";
import UserProfileDrawer from "../../components/UserProfileDrawer";
import AvatarUpload from "../../components/AvatarUpload";
import request from "../../utils/request";
import PostCard from "../../components/PostCard/index.tsx";
import { useParams } from "react-router-dom";

const roleColor = (role: string) => {
  if (role === "admin") return "red";
  if (role === "hr" || role === "employee") return "orange";
  return "blue";
};

const UserCenter: React.FC = () => {
  const params = useParams();
  const loginUserInfo = useLoginStore((state) => state.userInfo);
  const setLoginUserInfo = useLoginStore((state) => state.setUserInfo);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);
  const isSelf = !params.id || params.id === loginUserInfo?.userId;

  // 获取用户信息
  useEffect(() => {
    setUserInfoLoaded(false);
    if (!params.id || params.id === loginUserInfo?.userId) {
      setUserInfo(loginUserInfo);
      setUserInfoLoaded(true);
    } else {
      request.get(`/users/update-profile?userId=${params.id}`).then((res) => {
        if (res.data?.data) setUserInfo(res.data.data);
        setUserInfoLoaded(true);
      });
    }
  }, [params.id, loginUserInfo]);

  // 获取帖子
  useEffect(() => {
    if (userInfoLoaded && userInfo) {
      const authorId = userInfo.userId || userInfo._id;
      if (authorId) {
        request.get("/posts", { params: { author: authorId } }).then((res) => {
          if (res.data?.data) {
            setPosts(res.data.data);
          }
        });
      }
    }
  }, [userInfo, userInfoLoaded]);

  const handleAvatarUploadSuccess = async (avatarUrl: string) => {
    if (userInfo) {
      const updatedUserInfo = { ...userInfo, avatar: avatarUrl };
      setLoginUserInfo(updatedUserInfo);
      setUserInfo(updatedUserInfo);
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
      <div className="ucenter-profile-card" style={{ marginTop: 0 }}>
        {isSelf && (
          <AvatarUpload
            src={userInfo?.avatar}
            size={96}
            onUploadSuccess={handleAvatarUploadSuccess}
          />
        )}
        {!isSelf && (
          <Avatar
            src={userInfo?.avatar}
            size={96}
            style={{ background: "#eee", marginRight: 24 }}
          />
        )}
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
                {isSelf && (
                  <EditOutlined
                    style={{ marginLeft: 8, cursor: "pointer" }}
                    onClick={() => setDrawerOpen(true)}
                  />
                )}
              </>
            ) : (
              <>
                点击添加简介，让大家认识你
                {isSelf && (
                  <EditOutlined
                    style={{ marginLeft: 8, cursor: "pointer" }}
                    onClick={() => setDrawerOpen(true)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {isSelf && (
        <UserProfileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          userInfo={userInfo}
        />
      )}
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
