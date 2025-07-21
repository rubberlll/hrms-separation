import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  List,
  Avatar,
  message,
} from "antd";
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";

interface Job {
  _id: string;
  title: string;
  department: {
    _id: string;
    name: string;
  };
  location: string;
  createdAt: string;
  salaryRange: string;
  status: string;
  jobType: string;
  applicantCount?: number;
  viewCount?: number;
}

interface Activity {
  type: string;
  content: string;
  status: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [statistics, setStatistics] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalDepartments: 0,
    todayInterviews: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 获取职位列表
      const jobsRes = await request.get("/jobs");
      if (jobsRes.data.code === 200) {
        setJobs(jobsRes.data.data);
      }

      // 获取统计数据
      const [departmentsRes, resumesRes] = await Promise.all([
        request.get("/departments"),
        request.get("/resumes"),
      ]);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      setStatistics({
        totalJobs: jobsRes.data.data.length,
        totalCandidates:
          resumesRes.data.code === 200 ? resumesRes.data.data.length : 0,
        totalDepartments:
          departmentsRes.data.code === 200
            ? departmentsRes.data.data.length
            : 0,
        todayInterviews:
          resumesRes.data.code === 200
            ? resumesRes.data.data.filter(
                (resume: any) =>
                  resume.interviewProcess?.interviewDate &&
                  new Date(resume.interviewProcess.interviewDate) >= todayStart
              ).length
            : 0,
      });

      // 生成最近活动
      const recentActivities = [
        ...jobsRes.data.data.slice(0, 2).map((job: Job) => ({
          type: "新",
          content: `新职位发布 ${job.title} - ${
            job.department?.name || "未知部门"
          }`,
          status: "成功",
          time: new Date(job.createdAt).toLocaleString(),
        })),
        ...resumesRes.data.data.slice(0, 2).map((resume: any) => ({
          type: "新",
          content: `新候选人申请 ${
            resume.userId?.username || "未知用户"
          }申请了${resume.jobId?.title || "未知职位"}职位`,
          status: "信息",
          time: new Date(resume.submittedAt).toLocaleString(),
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setActivities(recentActivities);
    } catch (error) {
      console.error("获取数据失败:", error);
      message.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总职位数"
              value={statistics.totalJobs}
              prefix={<BankOutlined />}
              valueStyle={{ fontWeight: 700 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃候选人"
              value={statistics.totalCandidates}
              prefix={<UserOutlined />}
              valueStyle={{ fontWeight: 700 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={statistics.totalDepartments}
              prefix={<TeamOutlined />}
              valueStyle={{ fontWeight: 700 }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日面试"
              value={statistics.todayInterviews}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontWeight: 700 }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={16}>
          <Card
            title="热门职位"
            extra={<Button type="link">查看全部</Button>}
            style={{ marginBottom: 24 }}
            loading={loading}
          >
            <List
              itemLayout="vertical"
              dataSource={jobs.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<BankOutlined />} />}
                    title={
                      <span style={{ fontWeight: 700 }}>{item.title}</span>
                    }
                    description={
                      <>
                        {item.department?.name || "未知部门"} · {item.location}{" "}
                        · {new Date(item.createdAt).toLocaleDateString()} <br />
                        <Tag color="orange">
                          {item.salaryRange || "薪资面议"}
                        </Tag>
                        <Tag color="green">{item.status}</Tag>
                        <span style={{ marginLeft: 16 }}>{item.jobType}</span>
                        <span style={{ marginLeft: 16 }}>
                          {item.applicantCount || 0} 申请
                        </span>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最近活动" loading={loading}>
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={item.status === "成功" ? "green" : "blue"}>
                        {item.status}
                      </Tag>
                    }
                    title={<span>{item.content}</span>}
                    description={
                      <span style={{ color: "#aaa" }}>{item.time}</span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
