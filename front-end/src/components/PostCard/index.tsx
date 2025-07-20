import React from "react";
import { Avatar } from "antd";
import "./index.less";

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
    <div className="post-card">
      <div className="post-card-header">
        <Avatar src={userInfo?.avatar} size={40} className="post-card-avatar" />
        <div>
          <div className="post-card-user">
            {userInfo?.nickname || userInfo?.username}
          </div>
          <div className="post-card-meta">
            {post.createdAt ? formatTime(post.createdAt) : ""}
            <span className="school-job">
              {userInfo?.school} {userInfo?.jobIntention}
            </span>
          </div>
        </div>
      </div>
      <div className="post-card-title">{post.title}</div>
      <div className="post-card-content">{post.content}</div>
      {/* 可加操作按钮等 */}
    </div>
  );
};

export default PostCard;
