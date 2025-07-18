import React from "react";
import UserDropdown from "../../components/UserDropdown";
import { Carousel } from "antd";
import { Card, Row, Col } from "antd";
import "./home.less";

// 简单Navbar组件
const Navbar: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: 60,
      background: "#001529",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 40px",
      boxSizing: "border-box",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700 }}>HRMS 招聘平台</div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <a href="/" style={{ color: "#fff", marginRight: 24 }}>
        首页
      </a>
      <a href="/recruitment/jobs" style={{ color: "#fff", marginRight: 24 }}>
        职位
      </a>
      <a
        href="/recruitment/my-applications"
        style={{ color: "#fff", marginRight: 24 }}
      >
        我的投递
      </a>
      <a href="/recruitment/resume" style={{ color: "#fff", marginRight: 24 }}>
        简历
      </a>
      <UserDropdown />
    </div>
  </div>
);

// 轮播图内容
const carouselItems = [
  {
    title: "智能职位推荐",
    desc: "根据你的简历和兴趣，智能推荐最适合你的职位。",
    img: require("../../assets/images/jobFinder.png"),
  },
  {
    title: "一键投递简历",
    desc: "简历一键投递，快速进入面试流程。",
    img: require("../../assets/images/tabRight.png"),
  },
  {
    title: "企业直聊",
    desc: "与HR直接沟通，了解企业文化和岗位需求。",
    img: require("../../assets/images/recruiterFinder.png"),
  },
  {
    title: "面试进度追踪",
    desc: "实时查看投递进度，掌握每一步动态。",
    img: require("../../assets/images/manage.jpg"),
  },
];

const ExperienceList = [
  {
    title: "字节跳动前端实习面经",
    company: "字节跳动",
    author: "小明",
    content: "面试分为三轮，主要考察JS基础、项目经验和算法...",
  },
  {
    title: "腾讯后台开发面试经验",
    company: "腾讯",
    author: "小红",
    content: "一面算法，二面系统设计，三面HR...",
  },
  {
    title: "阿里巴巴算法岗面经",
    company: "阿里巴巴",
    author: "小李",
    content: "主要问了LeetCode高频题和项目优化...",
  },
];

const Home: React.FC = () => {
  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh" }}>
      <Navbar />
      {/* 轮播图部分 */}
      <div
        style={{
          maxWidth: 1000,
          margin: "32px auto 0",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px #eee",
          padding: 32,
        }}
      >
        <Carousel autoplay dots>
          {carouselItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 320,
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                style={{
                  width: 260,
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginRight: 48,
                }}
              />
              <div>
                <h2 style={{ fontSize: 28, marginBottom: 12 }}>{item.title}</h2>
                <p style={{ fontSize: 18, color: "#666" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
      {/* 面试经验区块 */}
      <div
        style={{
          maxWidth: 1000,
          margin: "32px auto",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px #eee",
          padding: 32,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>
          精选面试经验
        </h2>
        <Row gutter={[24, 24]}>
          {ExperienceList.map((exp, idx) => (
            <Col span={8} key={idx}>
              <Card
                title={exp.title}
                bordered={false}
                style={{ minHeight: 180 }}
              >
                <div style={{ color: "#888", marginBottom: 8 }}>
                  {exp.company} | by {exp.author}
                </div>
                <div style={{ color: "#333" }}>{exp.content}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
