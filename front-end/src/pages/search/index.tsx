import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import request from "../../utils/request";
import PostCard from "../../components/PostCard";
import { Spin } from "antd";
import "./index.less";

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
    <div className="search-result-container">
      <h2 className="search-result-title">搜索关键字：{keyword}</h2>
      {loading ? (
        <Spin size="large" tip="搜索中..." />
      ) : posts.length === 0 ? (
        <div className="search-result-empty">暂无相关帖子</div>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} userInfo={post.author} />
        ))
      )}
    </div>
  );
};

export default SearchResult;
