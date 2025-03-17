import React, { useState, useEffect } from "react";
import { useJobStore } from "../store/useJobStore";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Space,
  Collapse,
  Radio,
  Select,
  DatePicker,
  message,
  Pagination,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import request from "../utils/request";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const Job = () => {
  const { jobs, loading, fetchJobs, addJob, updateJob, deleteJob } =
    useJobStore();
  const [form] = Form.useForm();
  const [activeView, setActiveView] = useState<"publish" | "list">("publish");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, [fetchJobs]);

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await request.get("/departments");
      setDepartments(response.data.data);
    } catch (error) {
      console.error("获取部门列表失败:", error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingJobId) {
        await updateJob(editingJobId, {
          ...values,
          expiryDate: values.expiryDate
            ? values.expiryDate.format("YYYY-MM-DD")
            : undefined,
        });
        message.success("职位更新成功");
        setEditingJobId(null);
      } else {
        await addJob({
          ...values,
          expiryDate: values.expiryDate
            ? values.expiryDate.format("YYYY-MM-DD")
            : undefined,
        });
        message.success("职位发布成功");
      }
      form.resetFields();
    } catch (error) {
      console.error("提交失败:", error);
    }
  };

  const handleEdit = (job: any) => {
    setActiveView("publish");
    setEditingJobId(job._id);

    // 处理部门数据
    const departmentValue =
      typeof job.department === "object" ? job.department._id : job.department;

    form.setFieldsValue({
      ...job,
      department: departmentValue,
      expiryDate: job.expiryDate ? dayjs(job.expiryDate) : undefined,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJob(id);
      message.success("职位删除成功");
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingJobId(null);
  };

  const getDepartmentName = (job: any) => {
    if (typeof job.department === "object" && job.department) {
      return job.department.name;
    }
    return job.department || "未分配";
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
    <Row justify="center" style={{ padding: 24 }}>
      <Col span={16}>
        <Radio.Group
          value={activeView}
          onChange={(e) => setActiveView(e.target.value)}
          style={{ marginBottom: 24 }}
          buttonStyle="solid"
        >
          <Radio.Button value="publish">发布新职位</Radio.Button>
          <Radio.Button value="list">查看已发布职位</Radio.Button>
        </Radio.Group>

        {activeView === "publish" ? (
          <Collapse defaultActiveKey={["1"]}>
            <Collapse.Panel
              header={editingJobId ? "编辑职位" : "发布新职位"}
              key="1"
            >
              <Card style={{ marginBottom: 24 }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Form.Item
                    label="职位名称"
                    name="title"
                    rules={[{ required: true, message: "请输入职位名称" }]}
                  >
                    <Input placeholder="请输入职位名称" />
                  </Form.Item>

                  <Form.Item
                    label="部门"
                    name="department"
                    rules={[{ required: true, message: "请选择部门" }]}
                  >
                    <Select
                      placeholder="请选择部门"
                      loading={departmentsLoading}
                    >
                      {departments.map((dept) => (
                        <Option key={dept._id} value={dept._id}>
                          {dept.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="职位描述"
                    name="description"
                    rules={[{ required: true, message: "请输入职位描述" }]}
                  >
                    <TextArea rows={4} placeholder="请输入职位描述" />
                  </Form.Item>

                  <Form.Item
                    label="工作地点"
                    name="location"
                    rules={[{ required: true, message: "请输入工作地点" }]}
                  >
                    <Input placeholder="请输入工作地点" />
                  </Form.Item>

                  <Form.Item label="薪资范围" name="salaryRange">
                    <Input placeholder="请输入薪资范围，例如：15k-25k" />
                  </Form.Item>

                  <Form.Item
                    label="职位状态"
                    name="status"
                    rules={[{ required: true, message: "请选择职位状态" }]}
                    initialValue="open"
                  >
                    <Select placeholder="请选择职位状态">
                      <Option value="open">开放中</Option>
                      <Option value="closed">已关闭</Option>
                      <Option value="archived">已归档</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="招聘类型" name="jobType">
                    <Select placeholder="请选择招聘类型">
                      <Option value="社招">社招</Option>
                      <Option value="校招">校招</Option>
                      <Option value="实习">实习</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="截止日期" name="expiryDate">
                    <DatePicker
                      placeholder="请选择截止日期"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={
                          editingJobId ? <EditOutlined /> : <PlusOutlined />
                        }
                        loading={loading}
                      >
                        {editingJobId ? "更新职位" : "发布职位"}
                      </Button>
                      {editingJobId && (
                        <Button onClick={handleCancel}>取消</Button>
                      )}
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Collapse.Panel>
          </Collapse>
        ) : (
          <>
            <Title level={3}>已发布的职位</Title>

            {/* 搜索和筛选区域 */}
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Input.Search
                    placeholder="搜索职位名称、描述或地点"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={(value) => setSearchText(value)}
                    allowClear
                  />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="按状态筛选"
                    style={{ width: "100%" }}
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value)}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="open">招聘中</Option>
                    <Option value="closed">已关闭</Option>
                    <Option value="archived">已归档</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="按部门筛选"
                    style={{ width: "100%" }}
                    value={filterDepartment}
                    onChange={(value) => setFilterDepartment(value)}
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
                <Col span={4}>
                  <Button onClick={resetFilters}>重置筛选</Button>
                </Col>
              </Row>
            </Card>

            {loading ? (
              <div>加载中...</div>
            ) : (
              <>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {filteredJobs.length === 0 ? (
                    <Card>
                      <Typography.Text>暂无符合条件的职位信息</Typography.Text>
                    </Card>
                  ) : (
                    paginatedJobs.map((job) => (
                      <Card
                        key={job._id}
                        actions={[
                          <Button
                            key="edit"
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(job)}
                          >
                            编辑
                          </Button>,
                          <Button
                            key="delete"
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(job._id)}
                          >
                            删除
                          </Button>,
                        ]}
                      >
                        <Title level={4} style={{ margin: 0 }}>
                          {job.title}
                          <Typography.Text
                            type={
                              job.status === "open"
                                ? "success"
                                : job.status === "closed"
                                ? "warning"
                                : "secondary"
                            }
                            style={{ fontSize: "14px", marginLeft: "10px" }}
                          >
                            {job.status === "open"
                              ? "招聘中"
                              : job.status === "closed"
                              ? "已关闭"
                              : "已归档"}
                          </Typography.Text>
                        </Title>
                        <Typography.Text type="secondary">
                          {getDepartmentName(job)} · {job.location}
                          {job.jobType && ` · ${job.jobType}`}
                        </Typography.Text>
                        {job.salaryRange && (
                          <Typography.Text
                            type="success"
                            style={{ display: "block", marginTop: 8 }}
                          >
                            {job.salaryRange}
                          </Typography.Text>
                        )}
                        <Typography.Paragraph style={{ marginTop: 16 }}>
                          <strong>职位描述：</strong>
                          <br />
                          {job.description}
                        </Typography.Paragraph>
                        {job.expiryDate && (
                          <Typography.Text type="secondary">
                            截止日期:{" "}
                            {dayjs(job.expiryDate).format("YYYY-MM-DD")}
                          </Typography.Text>
                        )}
                      </Card>
                    ))
                  )}
                </Space>

                {/* 分页控件 */}
                {filteredJobs.length > 0 && (
                  <Row justify="end" style={{ marginTop: 16 }}>
                    <Col>
                      <Typography.Text style={{ marginRight: 16 }}>
                        共 {filteredJobs.length} 条记录
                      </Typography.Text>
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredJobs.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                      />
                    </Col>
                  </Row>
                )}
              </>
            )}
          </>
        )}
      </Col>
    </Row>
  );
};

export default Job;
