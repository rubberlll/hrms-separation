import React, { useState } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Pagination,
  Modal,
  Typography,
  Spin,
} from "antd";
import { useJobStore } from "../store/useJobStore";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

  // Mock departments - replace with your actual data
  const departments = [
    { _id: "1", name: "技术部" },
    { _id: "2", name: "市场部" },
    { _id: "3", name: "人力资源部" },
    { _id: "4", name: "财务部" },
    { _id: "5", name: "产品部" },
  ];

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
      <Title level={3}>已发布的职位</Title>
      <Card className="job-list-filter-card">
        <div className="job-list-filter-row">
          <Input
            placeholder="搜索职位名称、描述或地点"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220, marginRight: 16 }}
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 140, marginRight: 16 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="open">招聘中</Option>
            <Option value="closed">已关闭</Option>
            <Option value="archived">已归档</Option>
          </Select>
          <Select
            value={filterDepartment}
            onChange={setFilterDepartment}
            style={{ width: 140, marginRight: 16 }}
          >
            <Option value="all">全部部门</Option>
            {departments.map((dept) => (
              <Option key={dept._id} value={dept._id}>
                {dept.name}
              </Option>
            ))}
          </Select>
          <Button onClick={resetFilters}>重置筛选</Button>
        </div>
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
              actions={[
                <Button
                  key="edit"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(job._id)}
                >
                  编辑
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(job._id, job.title)}
                >
                  删除
                </Button>,
              ]}
            >
              <Title level={4} style={{ margin: 0 }}>
                {job.title}
              </Title>
              <Text type="secondary">
                {getDepartmentName(job)} · {job.location}
                {job.jobType && ` · ${job.jobType}`}
              </Text>
              {job.salaryRange && (
                <Text type="success" style={{ display: "block", marginTop: 8 }}>
                  {job.salaryRange}
                </Text>
              )}
              <div style={{ marginTop: 12 }}>
                <Text strong>职位描述：</Text>
                <div>{job.description}</div>
              </div>
              {job.expiryDate && (
                <Text type="secondary">截止日期: {job.expiryDate}</Text>
              )}
            </Card>
          ))}
          <div className="job-list-pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredJobs.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
