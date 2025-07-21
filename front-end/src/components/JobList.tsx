import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Pagination,
  Modal,
  Typography,
  Spin,
  Row,
  Col,
  message,
  Tag,
  Space,
} from "antd";
import { useJobStore } from "../store/useJobStore";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import request from "../utils/request";
// import "./JobList.less";

const { Option } = Select;
const { Title, Text } = Typography;

interface JobListProps {
  onEdit: (jobId: string) => void;
}

const JobList: React.FC<JobListProps> = ({ onEdit }) => {
  const { jobs, loading, deleteJob } = useJobStore();
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await request.get("/departments");
      if (response.data.code === 200) {
        setDepartments(response.data.data);
      } else {
        message.error(`获取部门列表失败: ${response.data.message}`);
        setDepartments([]);
      }
    } catch (error) {
      message.error("获取部门列表失败");
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Modal.confirm({
      title: "确认删除",
      content: `您确定要删除“${title}”这个职位吗？此操作无法撤销。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteJob(id);
        } catch (error) {
          Modal.error({ title: "删除失败", content: "请稍后重试" });
        }
      },
    });
  };

  const getDepartmentName = (job: any) => {
    if (typeof job.department === "object" && job.department) {
      return job.department.name;
    }
    const dept = departments.find((d) => d._id === job.department);
    return dept ? dept.name : "未分配";
  };

  const getStatusTag = (status: "open" | "closed" | "archived") => {
    switch (status) {
      case "open":
        return <Tag color="green">招聘中</Tag>;
      case "closed":
        return <Tag color="orange">已关闭</Tag>;
      case "archived":
        return <Tag color="default">已归档</Tag>;
      default:
        return null;
    }
  };

  // 筛选职位列表
  const filteredJobs = jobs.filter((job) => {
    // 搜索文本筛选
    const matchesSearch = searchText
      ? job.title.toLowerCase().includes(searchText.toLowerCase()) ||
        job.description.toLowerCase().includes(searchText.toLowerCase()) ||
        job.location.toLowerCase().includes(searchText.toLowerCase())
      : true;
    // 状态筛选
    const matchesStatus =
      filterStatus === "all" ? true : job.status === filterStatus;
    // 部门筛选
    const jobDeptId =
      typeof job.department === "object" && job.department
        ? job.department._id
        : job.department;
    const matchesDepartment =
      filterDepartment === "all" ? true : jobDeptId === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // 分页处理
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置筛选条件
  const resetFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setFilterDepartment("all");
    setCurrentPage(1);
  };

  return (
    <div className="job-list-container">
      <Title level={3} style={{ marginBottom: "24px" }}>
        已发布的职位
      </Title>
      <Card
        className="job-list-filter-card"
        style={{ marginBottom: "24px", border: "1px solid #faad14" }}
      >
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索职位名称、描述或地点"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={14}>
            <Row gutter={[16, 16]} justify="end">
              <Col>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 140 }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="open">招聘中</Option>
                  <Option value="closed">已关闭</Option>
                  <Option value="archived">已归档</Option>
                </Select>
              </Col>
              <Col>
                <Select
                  value={filterDepartment}
                  onChange={setFilterDepartment}
                  style={{ width: 140 }}
                  loading={departmentsLoading}
                >
                  <Option value="all">全部部门</Option>
                  {departments.map((dept) => (
                    <Option key={dept._id} value={dept._id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col>
                <Button onClick={resetFilters}>重置筛选</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      {loading ? (
        <div className="job-list-loading">
          <Spin size="large" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="job-list-empty">
          <Text>暂无符合条件的职位信息</Text>
        </Card>
      ) : (
        <div className="job-list-list">
          {paginatedJobs.map((job) => (
            <Card
              key={job._id}
              className="job-list-item"
              style={{ marginBottom: 24 }}
            >
              <Row align="top" justify="space-between">
                <Col flex="auto">
                  <Title
                    level={4}
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {job.title} {getStatusTag(job.status)}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    {getDepartmentName(job)} · {job.location}
                    {job.jobType && ` · ${job.jobType}`}
                  </Text>
                  {job.salaryRange && (
                    <Text
                      style={{
                        color: "#fa8c16",
                        fontSize: 16,
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 16,
                      }}
                    >
                      {job.salaryRange}
                    </Text>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>职位描述：</Text>
                    <Typography.Paragraph
                      type="secondary"
                      style={{ marginBottom: 0 }}
                    >
                      {job.description}
                    </Typography.Paragraph>
                  </div>
                  {job.expiryDate && (
                    <Text type="secondary">
                      截止日期: {new Date(job.expiryDate).toLocaleDateString()}
                    </Text>
                  )}
                </Col>
                <Col>
                  <Space direction="vertical">
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => onEdit(job._id)}
                      style={{ borderColor: "#faad14", color: "#faad14" }}
                    >
                      编辑
                    </Button>
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(job._id, job.title)}
                    >
                      删除
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
          <Row justify="space-between" align="middle" style={{ marginTop: 24 }}>
            <Col>
              <Text>共 {filteredJobs.length} 条记录</Text>
            </Col>
            <Col>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredJobs.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                itemRender={(current, type, originalElement) => {
                  if (type === "prev") {
                    return <Button>上一页</Button>;
                  }
                  if (type === "next") {
                    return <Button>下一页</Button>;
                  }
                  return originalElement;
                }}
              />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default JobList;
