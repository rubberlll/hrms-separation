import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import HeroBanner from "../../components/HeroBanner";
import PostCard from "../../components/PostCard";
import request from "../../utils/request";
import "./home.less";

const Home: React.FC = () => {
  const [publicPosts, setPublicPosts] = useState<any[]>([]);

  useEffect(() => {
    request.get("/posts").then((res) => {
      if (res.data?.data) {
        setPublicPosts(res.data.data);
      }
    });
  }, []);

  return (
    <div>
      <Navbar />
      {/* 轮播图部分 */}
      <div className="section">
        <div>
          <HeroBanner />
        </div>
      </div>
      {/* 精选面试经验区块 */}
      <div className="experience-section">
        <h2 className="experience-title">精选面试经验</h2>
        {publicPosts.length === 0 ? (
          <div style={{ color: "#aaa", textAlign: "center", margin: "48px 0" }}>
            暂无公开帖子
          </div>
        ) : (
          publicPosts.map((post) => (
            <PostCard key={post._id} post={post} userInfo={post.author} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
