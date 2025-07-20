import React, { useEffect, useState } from "react";
import request from "../../utils/request";
import { useLoginStore } from "../../store/useLoginStore";
import PostCard from "../../components/PostCard";
import { Button, Popconfirm, message, Spin, DatePicker, Radio } from "antd";
import dayjs from "dayjs";
import "./index.less";
import EditPostModal from "../../components/EditPostModal";

const { RangePicker } = DatePicker;

const PostManage: React.FC = () => {
  const userInfo = useLoginStore((state) => state.userInfo);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<"all" | "public" | "private">(
    "all"
  );
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const fetchPosts = () => {
    if (!userInfo?.userId) return;
    setLoading(true);
    request
      .get("/posts", { params: { author: userInfo.userId } })
      .then((res) => {
        setPosts(res.data?.data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [userInfo?.userId]);

  const handleDelete = async (id: string) => {
    await request.delete(`/posts/${id}`);
    message.success("删除成功");
    fetchPosts();
  };

  const handleToggleVisibility = async (post) => {
    const newVisibility = post.visibility === "private" ? "public" : "private";
    await request.put(`/posts/${post._id}`, { visibility: newVisibility });
    fetchPosts();
  };

  // 筛选逻辑
  const filteredPosts = posts.filter((post) => {
    if (visibility !== "all" && post.visibility !== visibility) return false;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const created = dayjs(post.createdAt);
      if (
        created.isBefore(dateRange[0], "day") ||
        created.isAfter(dateRange[1], "day")
      )
        return false;
    }
    return true;
  });

  return (
    <div className="post-manage-container">
      <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
        我的投稿管理
      </h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <Radio.Group
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="public">公开</Radio.Button>
          <Radio.Button value="private">仅自己可见</Radio.Button>
        </Radio.Group>
        <RangePicker
          value={dateRange as any}
          onChange={(v) => setDateRange(v as any)}
          style={{ borderRadius: 8 }}
          allowClear
          placeholder={["开始日期", "结束日期"]}
        />
        <span style={{ marginLeft: "auto", color: "#aaa" }}>
          共 {filteredPosts.length} 条动态
        </span>
      </div>
      {loading ? (
        <Spin size="large" tip="加载中..." />
      ) : filteredPosts.length === 0 ? (
        <div style={{ color: "#aaa", textAlign: "center", margin: "48px 0" }}>
          暂无投稿
        </div>
      ) : (
        filteredPosts.map((post) => (
          <div key={post._id} style={{ position: "relative" }}>
            <PostCard post={post} userInfo={userInfo} />
            <div
              style={{
                position: "absolute",
                right: 24,
                bottom: 12,
                display: "flex",
                gap: 8,
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  setEditingPost(post);
                  setEditModalOpen(true);
                }}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这条投稿吗？"
                onConfirm={() => handleDelete(post._id)}
                okText="删除"
                cancelText="取消"
              >
                <Button danger size="small">
                  删除
                </Button>
              </Popconfirm>
              <Button
                type={"default"}
                onClick={() => handleToggleVisibility(post)}
                size="small"
                style={{ minWidth: 80 }}
              >
                {post.visibility === "private" ? "仅自己可见" : "公开"}
              </Button>
            </div>
          </div>
        ))
      )}
      <EditPostModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        post={editingPost}
        onSuccess={fetchPosts}
      />
    </div>
  );
};

export default PostManage;
