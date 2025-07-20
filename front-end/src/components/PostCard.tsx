import React from "react";
import { Avatar } from "antd";

interface PostCardProps {
  post: any;
  userInfo: any;
}

const PostCard: React.FC<PostCardProps> = ({ post, userInfo }) => {
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${
      d.getMonth() + 1
    }/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div
      className="post-card"
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        marginBottom: 24,
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <Avatar src={userInfo?.avatar} size={40} style={{ marginRight: 12 }} />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: "#222",
              display: "flex",
              alignItems: "center",
            }}
          >
            {userInfo?.nickname || userInfo?.username}
          </div>
          <div style={{ fontSize: 13, color: "#aaa", margin: "2px 0 0 0" }}>
            {post.createdAt ? formatTime(post.createdAt) : ""}
            <span style={{ marginLeft: 8, color: "#bdbdbd" }}>
              {userInfo?.school} {userInfo?.jobIntention}
            </span>
          </div>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, margin: "8px 0" }}>
        {post.title}
      </div>
      <div style={{ color: "#333", marginBottom: 8 }}>{post.content}</div>
      {/* 可加操作按钮等 */}
    </div>
  );
};

export default PostCard;
