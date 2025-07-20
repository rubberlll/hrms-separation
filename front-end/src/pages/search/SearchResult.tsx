import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import request from "../../utils/request";
import PostCard from "../../components/PostCard";
import { Spin } from "antd";

const SearchResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const keyword = searchParams.get("q") || "";

  useEffect(() => {
    if (!keyword) return;
    setLoading(true);
    request.get("/posts/search", { params: { q: keyword } }).then((res) => {
      setPosts(res.data?.data || []);
      setLoading(false);
    });
  }, [keyword]);

  return (
    <div style={{ maxWidth: 800, margin: "32px auto" }}>
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
        搜索结果：{keyword}
      </h2>
      {loading ? (
        <Spin size="large" tip="搜索中..." />
      ) : posts.length === 0 ? (
        <div style={{ color: "#aaa", textAlign: "center", margin: "48px 0" }}>
          暂无相关帖子
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} userInfo={post.author} />
        ))
      )}
    </div>
  );
};

export default SearchResult;
