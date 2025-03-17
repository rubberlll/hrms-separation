import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Modal,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import request from "../utils/request";

const { Title } = Typography;

// 设置 PDF.js worker 路径
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ResumeType {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: "pending" | "reviewed" | "hired" | "rejected";
  submitTime: string;
  fileUrl: string;
  fileName: string;
  education?: {
    school: string;
    major: string;
    degree: string;
    graduationYear: string;
  };
  workExperience?: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  skills?: string[];
  jobId?: string;
  userId: string;
  interviewProcess?: {
    currentStage: "初筛" | "技术面试" | "HR面试" | "终面" | "offer谈判";
    interviewDate?: string;
    interviewer?: string;
    feedback?: string;
  };
  employmentInfo?: {
    employmentDate?: string;
    department?: string;
    position?: string;
    salary?: string;
    probationPeriod?: string;
    contractPeriod?: string;
  };
}

const Resume = () => {
  const [selectedResume, setSelectedResume] = useState<ResumeType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resumes, setResumes] = useState<ResumeType[]>([]);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await request.get("/resumes");
      if (response.data.code === 200) {
        // 转换后端数据格式为前端格式
        const formattedResumes = response.data.data.map((resume: any) => ({
          id: resume._id,
          name: resume.userId?.username || "未知",
          position: resume.jobId?.title || "未知职位",
          email: resume.userId?.email || "",
          phone: resume.userId?.phone || "",
          status: resume.status,
          submitTime: new Date(resume.submittedAt).toLocaleString(),
          fileUrl: resume.fileUrl,
          fileName: resume.fileName,
          education: resume.education,
          workExperience: resume.workExperience,
          skills: resume.skills,
          jobId: resume.jobId?._id,
          userId: resume.userId?._id,
          interviewProcess: resume.interviewProcess,
          employmentInfo: resume.employmentInfo,
        }));
        setResumes(formattedResumes);
      }
    } catch (error) {
      console.error("获取简历列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加更新简历状态的函数
  const updateResumeStatus = async (id: string, status: string) => {
    try {
      const response = await request.put(`/resumes/${id}`, { status });
      if (response.data.code === 200) {
        message.success("更新状态成功");

        // 如果状态是"hired"（已录用），则更新用户角色为"employee"
        if (status === "hired" && selectedResume) {
          try {
            const userResponse = await request.put(
              `/users/${selectedResume.userId}`,
              {
                role: "employee",
                status: "active",
              }
            );
            if (userResponse.data.code === 200) {
              message.success("已将用户角色更新为员工");
            }
          } catch (error) {
            console.error("更新用户角色失败:", error);
            message.error("更新用户角色失败");
          }
        }

        fetchResumes(); // 刷新列表
      }
    } catch (error) {
      console.error("更新简历状态失败:", error);
    }
  };

  // 检查用户是否已被录用
  const checkUserHired = async (userId: string) => {
    try {
      const response = await request.get(`/resumes/user/${userId}`);
      if (response.data.code === 200) {
        // 检查该用户是否有已录用的简历
        const hasHired = response.data.data.some(
          (resume: any) => resume.status === "hired"
        );
        return hasHired;
      }
      return false;
    } catch (error) {
      console.error("检查用户录用状态失败:", error);
      return false;
    }
  };

  // 状态映射
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "待处理",
      reviewed: "已审核",
      hired: "已录用",
      rejected: "已拒绝",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "gold",
      reviewed: "blue",
      hired: "green",
      rejected: "red",
    };
    return colorMap[status] || "default";
  };

  const columns: ColumnsType<ResumeType> = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "应聘职位",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "投递时间",
      dataIndex: "submitTime",
      key: "submitTime",
      sorter: (a, b) =>
        new Date(a.submitTime).getTime() - new Date(b.submitTime).getTime(),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        return (
          <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedResume(record);
              setIsModalOpen(true);
            }}
          >
            查看详情
          </Button>
          <Button
            type="link"
            onClick={() => {
              setSelectedResume(record);
              setIsPdfModalOpen(true);
            }}
          >
            查看简历附件
          </Button>
        </Space>
      ),
    },
  ];

  // 获取文件URL
  const getFileUrl = (url: string) => {
    // 如果URL已经是完整的URL，则直接返回
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // 确保URL格式正确，应该是/api/files/而不是/api/uploads/files/
    if (url.includes("/api/files/")) {
      return url.replace("/api/files/", "/api/files/");
    }

    // 如果URL以/files开头，则添加/api前缀
    if (url.startsWith("/files/")) {
      return `/api${url}`;
    }

    // 否则，确保URL以/api开头
    if (!url.startsWith("/api")) {
      return `/api${url}`;
    }
    return url;
  };

  // 添加一个函数来判断文件类型
  const isPdfFile = (fileName: string) => {
    return fileName && fileName.toLowerCase().endsWith(".pdf");
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={3}>简历管理</Title>
        <Table
          columns={columns}
          dataSource={resumes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="简历详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            关闭
          </Button>,
          <Button
            key="updateStatus"
            onClick={() => {
              if (selectedResume) {
                // 打开一个状态选择的模态框或下拉菜单
                // 这里简化为直接更新为"reviewed"状态
                updateResumeStatus(selectedResume.id, "reviewed");
                setIsModalOpen(false);
              }
            }}
          >
            标记为已审核
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => {
              if (selectedResume) {
                updateResumeStatus(selectedResume.id, "rejected");
                setIsModalOpen(false);
              }
            }}
          >
            拒绝
          </Button>,
          <Button
            key="hire"
            type="primary"
            onClick={async () => {
              if (selectedResume) {
                // 检查该用户是否已被录用
                const isHired = await checkUserHired(selectedResume.userId);
                if (isHired) {
                  message.warning("该用户已有被录用的简历，无法重复录用");
                  return;
                }

                updateResumeStatus(selectedResume.id, "hired");
                setIsModalOpen(false);
                // 这里可以添加录用信息填写的逻辑
              }
            }}
          >
            录用
          </Button>,
        ]}
      >
        {selectedResume && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="姓名" span={2}>
              {selectedResume.name}
            </Descriptions.Item>
            <Descriptions.Item label="应聘职位" span={2}>
              {selectedResume.position}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {selectedResume.email}
            </Descriptions.Item>
            <Descriptions.Item label="电话">
              {selectedResume.phone}
            </Descriptions.Item>

            <Descriptions.Item label="教育背景" span={2}>
              {selectedResume.education?.school} -{" "}
              {selectedResume.education?.major}
              <br />
              {selectedResume.education?.degree} ·{" "}
              {selectedResume.education?.graduationYear}年毕业
            </Descriptions.Item>

            <Descriptions.Item label="工作经历" span={2}>
              {selectedResume.workExperience?.map((exp, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <strong>{exp.company}</strong> - {exp.position}
                  <br />
                  {exp.duration}
                  <br />
                  {exp.description}
                </div>
              ))}
            </Descriptions.Item>

            {selectedResume.interviewProcess && (
              <Descriptions.Item label="面试进度" span={2}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    当前阶段：{selectedResume.interviewProcess.currentStage}
                  </div>
                  {selectedResume.interviewProcess.interviewDate && (
                    <div>
                      面试时间：{selectedResume.interviewProcess.interviewDate}
                    </div>
                  )}
                  {selectedResume.interviewProcess.interviewer && (
                    <div>
                      面试官：{selectedResume.interviewProcess.interviewer}
                    </div>
                  )}
                  {selectedResume.interviewProcess.feedback && (
                    <div>
                      面试反馈：{selectedResume.interviewProcess.feedback}
                    </div>
                  )}
                </Space>
              </Descriptions.Item>
            )}

            {selectedResume.employmentInfo && (
              <Descriptions.Item label="录用信息" span={2}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {selectedResume.employmentInfo.employmentDate && (
                    <div>
                      入职日期：{selectedResume.employmentInfo.employmentDate}
                    </div>
                  )}
                  {selectedResume.employmentInfo.department && (
                    <div>
                      入职部门：{selectedResume.employmentInfo.department}
                    </div>
                  )}
                  {selectedResume.employmentInfo.position && (
                    <div>职位：{selectedResume.employmentInfo.position}</div>
                  )}
                  {selectedResume.employmentInfo.salary && (
                    <div>薪资：{selectedResume.employmentInfo.salary}</div>
                  )}
                  {selectedResume.employmentInfo.probationPeriod && (
                    <div>
                      试用期：{selectedResume.employmentInfo.probationPeriod}
                    </div>
                  )}
                  {selectedResume.employmentInfo.contractPeriod && (
                    <div>
                      合同期限：{selectedResume.employmentInfo.contractPeriod}
                    </div>
                  )}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="简历附件"
        open={isPdfModalOpen}
        onCancel={() => setIsPdfModalOpen(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setIsPdfModalOpen(false)}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() =>
              selectedResume && window.open(getFileUrl(selectedResume.fileUrl))
            }
          >
            下载
          </Button>,
        ]}
        styles={{ body: { height: "80vh" } }}
      >
        {selectedResume && (
          <div style={{ height: "100%", width: "100%" }}>
            <Typography.Text
              strong
              style={{ display: "block", marginBottom: 10 }}
            >
              文件名：{selectedResume.fileName}
            </Typography.Text>
            <iframe
              src={getFileUrl(selectedResume.fileUrl)}
              style={{ width: "100%", height: "70vh", border: "none" }}
              title="简历预览"
            >
              <p>
                您的浏览器不支持iframe。
                <a
                  href={getFileUrl(selectedResume.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  点击下载
                </a>
              </p>
            </iframe>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Resume;
