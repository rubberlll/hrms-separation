import React from "react";
import { Card, Row, Col, Statistic, Tag, Button, List, Avatar } from "antd";
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const Dashboard: React.FC = () => {
  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总职位数"
              value={1234}
              prefix={<BankOutlined />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div style={{ color: "#1dbf73", fontSize: 14, marginTop: 8 }}>
              ↑ +12% 较上月
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃候选人"
              value={8567}
              prefix={<UserOutlined />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div style={{ color: "#1dbf73", fontSize: 14, marginTop: 8 }}>
              ↑ +8% 较上月
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="合作企业"
              value={456}
              prefix={<TeamOutlined />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div style={{ color: "#1dbf73", fontSize: 14, marginTop: 8 }}>
              ↑ +5% 较上月
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日面试"
              value={23}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div style={{ color: "#f44336", fontSize: 14, marginTop: 8 }}>
              ↓ -3% 较上月
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={16}>
          <Card
            title="热门职位"
            extra={<Button type="link">查看全部</Button>}
            style={{ marginBottom: 24 }}
          >
            <List
              itemLayout="vertical"
              dataSource={[
                {
                  title: "高级前端开发工程师",
                  company: "阿里巴巴",
                  location: "杭州",
                  date: "2024-01-15",
                  salary: "25K-40K",
                  status: "招聘中",
                  applicants: 45,
                  views: 234,
                },
                {
                  title: "React开发工程师",
                  company: "字节跳动",
                  location: "北京",
                  date: "2024-01-14",
                  salary: "20K-35K",
                  status: "招聘中",
                  applicants: 32,
                  views: 180,
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <span key="views">
                      <EyeOutlined /> {item.views}
                    </span>,
                    <Button key="edit" type="link">
                      编辑
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<BankOutlined />} />}
                    title={
                      <span style={{ fontWeight: 700 }}>{item.title}</span>
                    }
                    description={
                      <>
                        {item.company} · {item.location} · {item.date} <br />
                        <Tag color="orange">{item.salary}</Tag>
                        <Tag color="green">{item.status}</Tag>
                        <span style={{ marginLeft: 16 }}>全职</span>
                        <span style={{ marginLeft: 16 }}>
                          {item.applicants} 申请
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
          <Card title="最近活动">
            <List
              itemLayout="horizontal"
              dataSource={[
                {
                  type: "新",
                  content: "新职位发布 前端开发工程师 - 阿里巴巴",
                  status: "成功",
                  time: "2分钟前",
                },
                {
                  type: "新",
                  content: "新候选人申请 张三申请了React开发工程师职位",
                  status: "信息",
                  time: "5分钟前",
                },
              ]}
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
