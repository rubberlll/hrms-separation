import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Upload,
  Button,
  message,
  Select,
  Spin,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";
import dayjs from "dayjs";
import "./index.less";

const ApplyPage: React.FC = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "apply">("list");
  const [searchText, setSearchText] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterJobType, setFilterJobType] = useState<string>("all");
  const [departments, setDepartments] = useState<any[]>([]);

  // 添加工作经验和教育经历的状态
  const [workExperiences, setWorkExperiences] = useState<any[]>([{}]);
  const [educations, setEducations] = useState<any[]>([{}]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    // 获取所有发布的职位
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await request.get("/jobs");
        setJobs(response.data.data || []);
      } catch (error) {
        console.error("获取职位列表失败:", error);
        message.error("获取职位列表失败");
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await request.get("/departments");
        setDepartments(response.data.data || []);
      } catch (error) {
        console.error("获取部门列表失败:", error);
      }
    };

    fetchJobs();
    fetchDepartments();
  }, []);

  const handleUpload = {
    customRequest: async ({ file, onSuccess, onError }: any) => {
      const chunkSize = 1024 * 1024; // 1MB 每片
      const chunks = Math.ceil(file.size / chunkSize);
      setUploading(true);

      try {
        const uploadChunks = async () => {
          for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(file.size, start + chunkSize);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("chunk", chunk);
            formData.append("fileName", file.name);
            formData.append("chunkIndex", String(i));
            formData.append("chunks", String(chunks));

            // 添加错误处理和重试逻辑
            let retries = 3;
            while (retries > 0) {
              try {
                const response = await request.post("/upload/chunk", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                });

                if (response.status !== 200) {
                  throw new Error(`上传失败: ${response.statusText}`);
                }

                break; // 成功则跳出重试循环
              } catch (err) {
                retries--;
                if (retries === 0) throw err;
                // 等待一秒后重试
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

          // 所有分片上传完成后，请求合并文件
          const mergeResponse = await request.post("/upload/merge", {
            fileName: file.name,
            chunks: chunks,
          });

          return mergeResponse.data.data;
        };

        const result = await uploadChunks();
        onSuccess(result);
        message.success(`${file.name} 上传成功`);
        return result;
      } catch (error) {
        console.error("上传错误详情:", error);
        onError(error);
        message.error(`${file.name} 上传失败: ${error.message || "未知错误"}`);
      } finally {
        setUploading(false);
      }
    },
    beforeUpload: (file: File) => {
      const isPDF = file.type === "application/pdf";
      if (!isPDF) {
        message.error("只能上传 PDF 文件！");
        return Upload.LIST_IGNORE;
      }
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error("文件大小不能超过 20MB！");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  const onFinish = async (values: any) => {
    try {
      if (fileList.length === 0) {
        message.error("请上传简历文件");
        return;
      }

      const fileInfo = fileList[0].response || {};

      // 处理工作经验数据，确保格式与后端模型匹配
      const formattedWorkExperience =
        values.workExperience?.map((exp: any) => ({
          company: exp.company,
          position: exp.position,
          duration: `${exp.startDate || ""} - ${exp.endDate || ""}`,
          description: exp.description,
        })) || [];

      // 处理教育经历数据，确保格式与后端模型匹配
      const formattedEducation = values.education?.[0]
        ? {
            school: values.education[0].school,
            major: values.education[0].major,
            degree: values.education[0].degree,
            graduationYear: values.education[0].endDate?.split("-")[0] || "",
          }
        : undefined;

      const submitData = {
        jobId: selectedJob._id,
        fileUrl: fileInfo.url,
        fileName: fileList[0].name,
        coverLetter: values.coverLetter,
        status: "pending",
        submittedAt: new Date(),
        // 使用格式化后的数据
        workExperience: formattedWorkExperience,
        education: formattedEducation,
        skills: values.skills || [],
      };

      await request.post("/resumes", submitData);
      message.success("简历提交成功！");
      form.resetFields();
      setFileList([]);
      setViewMode("list");
      setSelectedJob(null);
      // 重置新增的状态
      setWorkExperiences([{}]);
      setEducations([{}]);
      setSkills([]);
    } catch (error) {
      console.error("提交失败:", error);
      message.error("提交失败，请重试");
    }
  };

  const handleApplyJob = (job: any) => {
    setSelectedJob(job);
    setViewMode("apply");
    form.resetFields();
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedJob(null);
    form.resetFields();
    setFileList([]);
  };

  // 筛选职位列表
  const filteredJobs = jobs.filter((job) => {
    // 只显示开放中的职位
    if (job.status !== "open") return false;

    // 搜索文本筛选
    const matchesSearch = searchText
      ? job.title.toLowerCase().includes(searchText.toLowerCase()) ||
        job.description.toLowerCase().includes(searchText.toLowerCase()) ||
        job.location.toLowerCase().includes(searchText.toLowerCase())
      : true;

    // 部门筛选
    const jobDeptId =
      typeof job.department === "object" && job.department
        ? job.department._id
        : job.department;
    const matchesDepartment =
      filterDepartment === "all" ? true : jobDeptId === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  const getDepartmentName = (job: any) => {
    if (typeof job.department === "object" && job.department) {
      return job.department.name;
    }
    return job.department || "未分配";
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

  // 重置筛选条件
  const resetFilters = () => {
    setSearchText("");
    setFilterDepartment("all");
    setFilterStatus("all");
    setFilterJobType("all");
  };

  // 添加工作经验表单项
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, {}]);
  };

  // 移除工作经验表单项
  const removeWorkExperience = (index: number) => {
    const newWorkExperiences = [...workExperiences];
    newWorkExperiences.splice(index, 1);
    setWorkExperiences(newWorkExperiences);
  };

  // 添加教育经历表单项
  const addEducation = () => {
    setEducations([...educations, {}]);
  };

  // 移除教育经历表单项
  const removeEducation = (index: number) => {
    const newEducations = [...educations];
    newEducations.splice(index, 1);
    setEducations(newEducations);
  };

  return (
    <div className="apply-container">
      {viewMode === "list" ? (
        <>
          <h2 className="apply-title">职位列表</h2>
          <div className="apply-subtitle">
            发现您的理想工作机会 · 共找到 {filteredJobs.length} 个职位
          </div>
          <Spin spinning={loading}>
            {/* 搜索和筛选区域 */}
            <Card className="apply-search-card">
              <Row gutter={16} align="middle">
                <Col flex="1 1 260px">
                  <Input
                    className="apply-search-input"
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                    placeholder="搜索职位名称或描述"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col flex="0 0 180px">
                  <Select
                    className="apply-search-select"
                    placeholder="选择部门"
                    style={{ width: "100%" }}
                    value={filterDepartment}
                    onChange={(value) => setFilterDepartment(value)}
                  >
                    <Select.Option value="all">全部部门</Select.Option>
                    {departments.map((dept) => (
                      <Select.Option key={dept._id} value={dept._id}>
                        {dept.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col flex="0 0 150px">
                  <Select
                    className="apply-search-select"
                    placeholder="招聘状态"
                    style={{ width: "100%" }}
                    value={filterStatus}
                    onChange={(value) => setFilterStatus(value)}
                  >
                    <Select.Option value="all">全部状态</Select.Option>
                    <Select.Option value="open">招聘中</Select.Option>
                    <Select.Option value="closed">已关闭</Select.Option>
                    <Select.Option value="archived">已归档</Select.Option>
                  </Select>
                </Col>
                <Col flex="0 0 150px">
                  <Select
                    className="apply-search-select"
                    placeholder="招聘类型"
                    style={{ width: "100%" }}
                    value={filterJobType}
                    onChange={(value) => setFilterJobType(value)}
                  >
                    <Select.Option value="all">全部类型</Select.Option>
                    <Select.Option value="社招">社招</Select.Option>
                    <Select.Option value="校招">校招</Select.Option>
                    <Select.Option value="实习">实习</Select.Option>
                  </Select>
                </Col>
                <Col flex="0 0 110px">
                  <Button
                    className="apply-search-reset"
                    icon={<ReloadOutlined />}
                    onClick={resetFilters}
                  >
                    重置
                  </Button>
                </Col>
              </Row>
            </Card>

            {filteredJobs.length === 0 ? (
              <Card>
                <Typography.Text>暂无招聘中的职位</Typography.Text>
              </Card>
            ) : (
              <Space direction="vertical" style={{ width: "100%" }}>
                {filteredJobs.map((job) => (
                  <Card
                    key={job._id}
                    className="job-list-item"
                    style={{ marginBottom: 24 }}
                  >
                    <Row align="top" justify="space-between">
                      <Col flex="auto">
                        <Typography.Title
                          level={4}
                          style={{
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {job.title} {getStatusTag(job.status)}
                        </Typography.Title>
                        <Typography.Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 8 }}
                        >
                          {getDepartmentName(job)} · {job.location}
                          {job.jobType && ` · ${job.jobType}`}
                        </Typography.Text>
                        {job.salaryRange && (
                          <Typography.Text
                            style={{
                              color: "#fa8c16",
                              fontSize: 16,
                              fontWeight: 500,
                              display: "block",
                              marginBottom: 16,
                            }}
                          >
                            {job.salaryRange}
                          </Typography.Text>
                        )}
                        <div style={{ marginBottom: 16 }}>
                          <Typography.Text strong>职位描述：</Typography.Text>
                          <Typography.Paragraph
                            type="secondary"
                            style={{ marginBottom: 0 }}
                          >
                            {job.description}
                          </Typography.Paragraph>
                        </div>
                        {job.expiryDate && (
                          <Typography.Text type="secondary">
                            截止日期:{" "}
                            {new Date(job.expiryDate).toLocaleDateString()}
                          </Typography.Text>
                        )}
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          onClick={() => handleApplyJob(job)}
                        >
                          申请职位
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            )}
          </Spin>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToList}
              className="apply-back-btn"
            >
              返回
            </Button>
            <Typography.Title
              level={3}
              style={{ display: "inline-block", margin: 0 }}
            >
              职位申请
            </Typography.Title>
            <Typography.Text style={{ marginLeft: 8 }}>
              {selectedJob?.title}
            </Typography.Text>
          </div>

          <Card style={{ marginBottom: 16 }}>
            <Typography.Title level={4}>{selectedJob?.title}</Typography.Title>
            <Typography.Text type="secondary">
              {getDepartmentName(selectedJob)} · {selectedJob?.location}
              {selectedJob?.jobType && ` · ${selectedJob?.jobType}`}
            </Typography.Text>
            {selectedJob?.salaryRange && (
              <Typography.Text type="success" className="apply-job-salary">
                {selectedJob?.salaryRange}
              </Typography.Text>
            )}
            <Typography.Paragraph className="apply-job-desc">
              <strong>职位描述：</strong>
              <br />
              {selectedJob?.description}
            </Typography.Paragraph>
          </Card>

          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="resume"
              label="上传简历"
              rules={[{ required: true, message: "请上传简历" }]}
            >
              <Upload
                {...handleUpload}
                maxCount={1}
                accept=".pdf"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  选择文件
                </Button>
              </Upload>
            </Form.Item>

            {/* 工作经验部分 */}
            <Card title="工作经验" className="apply-section">
              {workExperiences.map((_, index) => (
                <div key={index} className="apply-section">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={["workExperience", index, "company"]}
                        label="公司名称"
                        rules={[{ required: true, message: "请输入公司名称" }]}
                      >
                        <Input placeholder="公司名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["workExperience", index, "position"]}
                        label="职位"
                        rules={[{ required: true, message: "请输入职位" }]}
                      >
                        <Input placeholder="职位" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={["workExperience", index, "startDate"]}
                        label="开始日期"
                      >
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["workExperience", index, "endDate"]}
                        label="结束日期"
                      >
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name={["workExperience", index, "description"]}
                    label="工作描述"
                  >
                    <Input.TextArea rows={3} placeholder="工作职责和成就" />
                  </Form.Item>
                  {workExperiences.length > 1 && (
                    <Button
                      type="dashed"
                      danger
                      onClick={() => removeWorkExperience(index)}
                      className="apply-add-btn"
                    >
                      删除此工作经验
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="dashed"
                onClick={addWorkExperience}
                block
                className="apply-add-btn"
              >
                + 添加工作经验
              </Button>
            </Card>

            {/* 教育经历部分 */}
            <Card title="教育经历" className="apply-section">
              {educations.map((_, index) => (
                <div key={index} className="apply-section">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={["education", index, "school"]}
                        label="学校名称"
                        rules={[{ required: true, message: "请输入学校名称" }]}
                      >
                        <Input placeholder="学校名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["education", index, "degree"]}
                        label="学位"
                        rules={[{ required: true, message: "请输入学位" }]}
                      >
                        <Input placeholder="学位" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={["education", index, "startDate"]}
                        label="开始日期"
                      >
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={["education", index, "endDate"]}
                        label="结束日期"
                      >
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name={["education", index, "major"]} label="专业">
                    <Input placeholder="专业" />
                  </Form.Item>
                  {educations.length > 1 && (
                    <Button
                      type="dashed"
                      danger
                      onClick={() => removeEducation(index)}
                      className="apply-add-btn"
                    >
                      删除此教育经历
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="dashed"
                onClick={addEducation}
                block
                className="apply-add-btn"
              >
                + 添加教育经历
              </Button>
            </Card>

            {/* 技能部分 */}
            <Form.Item name="skills" label="技能">
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="输入技能并按回车添加"
                onChange={(value) => setSkills(value)}
              />
            </Form.Item>

            <Form.Item
              name="coverLetter"
              label="求职信"
              rules={[{ required: true, message: "请填写求职信" }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                提交申请
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default ApplyPage;
