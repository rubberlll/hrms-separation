import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Card,
  Tag,
  Tabs,
  Form,
  Row,
  Col,
  Space,
  Typography,
  Upload,
  message,
  Divider,
  DatePicker,
  Spin,
} from "antd";
import type { AxiosResponse } from "axios";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  BookOutlined,
  ToolOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";
import dayjs from "dayjs";
import "./index.less";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface Job {
  _id: string;
  title: string;
  department: {
    _id: string;
    name: string;
  };
  location: string;
  jobType?: string;
  salaryRange?: string;
  description: string;
  requirements?: string[];
  status: "open" | "closed" | "archived";
  expiryDate?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

interface Department {
  _id: string;
  name: string;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

const JobApplicationPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"list" | "apply">("list");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("全部部门");
  const [filterJobType, setFilterJobType] = useState("全部类型");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // 获取职位列表
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await request.get<any, AxiosResponse<ApiResponse<Job[]>>>(
        "/jobs"
      );
      if (res.data.code === 200) {
        setJobs(res.data.data);
      }
    } catch (error) {
      message.error("获取职位列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取部门列表
  const fetchDepartments = async () => {
    try {
      const res = await request.get<
        any,
        AxiosResponse<ApiResponse<Department[]>>
      >("/departments");
      if (res.data.code === 200) {
        setDepartments(res.data.data);
      }
    } catch (error) {
      message.error("获取部门列表失败");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchText === "" ||
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesDepartment =
      filterDepartment === "全部部门" ||
      job.department.name === filterDepartment;
    const matchesJobType =
      filterJobType === "全部类型" || job.jobType === filterJobType;

    return (
      job.status === "open" &&
      matchesSearch &&
      matchesDepartment &&
      matchesJobType
    );
  });

  const handleApplyJob = (job: Job) => {
    setSelectedJob(job);
    setViewMode("apply");
    form.resetFields();
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedJob(null);
    form.resetFields();
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      message.error("只支持上传PDF文件");
      return false;
    }

    if (file.size > 20 * 1024 * 1024) {
      message.error("文件大小不能超过20MB");
      return false;
    }

    try {
      setUploading(true);
      // 这里实现分片上传逻辑
      const chunkSize = 2 * 1024 * 1024; // 2MB per chunk
      const chunks = Math.ceil(file.size / chunkSize);
      const fileName = `${Date.now()}_${file.name}`;

      // 创建临时目录
      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("fileName", fileName);
        formData.append("chunkIndex", String(i));
        formData.append("chunks", String(chunks));

        await request.post("/upload/chunk", formData);
      }

      // 合并文件
      const mergeRes = await request.post<
        any,
        AxiosResponse<ApiResponse<{ url: string }>>
      >("/upload/merge", {
        fileName,
        chunks,
      });

      if (mergeRes.data.code === 200) {
        return mergeRes.data.data.url;
      }
      throw new Error("文件上传失败");
    } catch (error) {
      message.error("文件上传失败");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitApplication = async (values: any) => {
    if (!selectedJob) return;

    try {
      const fileUrl = await handleFileUpload(values.resume[0].originFileObj);
      if (!fileUrl) return;

      const submitData = {
        jobId: selectedJob._id,
        fileUrl,
        fileName: values.resume[0].name,
        education: values.education,
        workExperience: values.workExperience,
        skills: values.skills,
        coverLetter: values.coverLetter,
      };

      const res = await request.post<any, AxiosResponse<ApiResponse>>(
        "/resumes",
        submitData
      );
      if (res.data.code === 201) {
        message.success("申请提交成功！");
        handleBackToList();
      } else {
        message.error(res.data.message || "申请提交失败");
      }
    } catch (error) {
      message.error("申请提交失败");
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterDepartment("全部部门");
    setFilterJobType("全部类型");
  };

  const tabItems = [
    {
      key: "1",
      label: "简历信息",
      children: (
        <>
          <Form.Item
            label="上传简历"
            name="resume"
            rules={[{ required: true, message: "请上传您的简历" }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              accept=".pdf"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
              <p className="ant-upload-hint">支持PDF格式，文件大小不超过20MB</p>
            </Dragger>
          </Form.Item>
          <Form.Item label="技能标签" name="skills">
            <Select mode="tags" placeholder="输入技能后按回车确认" />
          </Form.Item>
        </>
      ),
    },
    {
      key: "2",
      label: "工作经验",
      children: (
        <Form.List name="workExperience">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} style={{ marginBottom: 16 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "company"]}
                    label="公司名称"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "position"]}
                    label="职位"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "startDate"]}
                        label="开始日期"
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "endDate"]}
                        label="结束日期"
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    {...restField}
                    name={[name, "description"]}
                    label="工作描述"
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Button
                    type="dashed"
                    danger
                    onClick={() => remove(name)}
                    block
                    icon={<DeleteOutlined />}
                  >
                    删除此项
                  </Button>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加工作经验
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "3",
      label: "教育背景",
      children: (
        <Form.List name="education">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} style={{ marginBottom: 16 }}>
                  <Form.Item
                    {...restField}
                    name={[name, "school"]}
                    label="学校名称"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "degree"]}
                    label="学位"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "major"]} label="专业">
                    <Input />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "startDate"]}
                        label="开始日期"
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "endDate"]}
                        label="结束日期"
                      >
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    type="dashed"
                    danger
                    onClick={() => remove(name)}
                    block
                    icon={<DeleteOutlined />}
                  >
                    删除此项
                  </Button>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                添加教育背景
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: "4",
      label: "求职信",
      children: (
        <Form.Item
          name="coverLetter"
          rules={[{ required: true, message: "请填写求职信" }]}
        >
          <Input.TextArea
            rows={8}
            placeholder="请介绍您的背景、技能和为什么适合这个职位..."
          />
        </Form.Item>
      ),
    },
  ];

  if (viewMode === "apply" && selectedJob) {
    return (
      <div className="apply-page-container">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
              返回职位列表
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                申请职位
              </Title>
              <Text type="secondary">{selectedJob.title}</Text>
            </div>
          </div>

          <Card className="job-card">
            <Title level={4}>{selectedJob.title}</Title>
            <Space size="middle" style={{ marginBottom: 16 }}>
              <Text type="secondary">
                <ApartmentOutlined className="job-card-icon" />
                {selectedJob.department.name}
              </Text>
              <Text type="secondary">
                <EnvironmentOutlined className="job-card-icon" />
                {selectedJob.location}
              </Text>
              <Text className="job-salary">
                <DollarOutlined className="job-card-icon" />
                {selectedJob.salaryRange}
              </Text>
            </Space>
            <Paragraph>{selectedJob.description}</Paragraph>
            <Space wrap>
              {selectedJob.requirements?.map((req) => (
                <Tag key={req}>{req}</Tag>
              ))}
            </Space>
          </Card>

          <Card className="apply-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitApplication}
            >
              <Tabs
                defaultActiveKey="1"
                items={tabItems}
                className="apply-form-tabs"
              />
              <Divider />
              <Form.Item>
                <Space>
                  <Button onClick={handleBackToList}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={uploading}>
                    提交申请
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page-container">
      <div className="page-title-header">
        <Title style={{ textAlign: "left" }}>职位招聘</Title>
        <Space size="large">
          <Text className="sub-title">发现您的理想工作机会</Text>
          <Text className="job-count">共找到 {filteredJobs.length} 个职位</Text>
        </Space>
      </div>

      <Card className="filter-card">
        <Row gutter={[16, 16]} align="bottom">
          <Col flex="auto">
            <Text>搜索职位</Text>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索职位名称或描述..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col>
            <Text>部门</Text>
            <Select
              value={filterDepartment}
              onChange={setFilterDepartment}
              style={{ width: 180 }}
            >
              <Option value="全部部门">全部部门</Option>
              {departments.map((dept) => (
                <Option key={dept._id} value={dept.name}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Text>工作类型</Text>
            <Select
              value={filterJobType}
              onChange={setFilterJobType}
              style={{ width: 150 }}
            >
              <Option value="全部类型">全部类型</Option>
              <Option value="全职">全职</Option>
              <Option value="兼职">兼职</Option>
              <Option value="实习">实习</Option>
            </Select>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
              重置
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {filteredJobs.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "48px" }}>
            <BookOutlined style={{ fontSize: 48, color: "#d1d5db" }} />
            <Title level={5}>暂无匹配的职位</Title>
            <Text type="secondary">请尝试调整搜索条件或筛选器</Text>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredJobs.map((job) => (
              <Col key={job._id} xs={24} md={12} lg={8}>
                <Card className="job-card" hoverable>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Row justify="space-between" align="top">
                      <Title level={5} className="job-card-title">
                        {job.title}
                      </Title>
                      <Tag color="green">招聘中</Tag>
                    </Row>
                    <Space>
                      <Text type="secondary">
                        <ApartmentOutlined className="job-card-icon" />
                        {job.department.name}
                      </Text>
                      <Text type="secondary">
                        <EnvironmentOutlined className="job-card-icon" />
                        {job.location}
                      </Text>
                      {job.jobType && (
                        <Text type="secondary">
                          <ClockCircleOutlined className="job-card-icon" />
                          {job.jobType}
                        </Text>
                      )}
                    </Space>
                    {job.salaryRange && (
                      <Text className="job-salary">{job.salaryRange}</Text>
                    )}
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {job.description}
                    </Paragraph>
                    {job.requirements && job.requirements.length > 0 && (
                      <Space wrap>
                        {job.requirements.slice(0, 3).map((req) => (
                          <Tag key={req}>{req}</Tag>
                        ))}
                        {job.requirements.length > 3 && (
                          <Tag>+{job.requirements.length - 3} 更多</Tag>
                        )}
                      </Space>
                    )}
                    <Divider style={{ margin: "12px 0" }} />
                    <Row justify="space-between" align="middle">
                      {job.expiryDate ? (
                        <Text type="secondary">
                          截止: {dayjs(job.expiryDate).format("YYYY-MM-DD")}
                        </Text>
                      ) : (
                        <Text type="secondary">
                          发布: {dayjs(job.createdAt).format("YYYY-MM-DD")}
                        </Text>
                      )}
                      <Button
                        type="primary"
                        onClick={() => handleApplyJob(job)}
                      >
                        申请职位
                      </Button>
                    </Row>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default JobApplicationPage;
