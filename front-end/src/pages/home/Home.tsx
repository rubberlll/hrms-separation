import React from "react";
import Navbar from "../../components/Navbar";
import UserDropdown from "../../components/UserDropdown/index";
import { Carousel } from "antd";
import { Card, Row, Col, Button } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import "./home.less";

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
    <div className="home-container">
      <Navbar />
      {/* 轮播图部分 */}
      <div className="carousel-section">
        <Carousel autoplay dots>
          {carouselItems.map((item, idx) => (
            <div key={idx} className="carousel-item">
              <img src={item.img} alt={item.title} className="carousel-image" />
              <div className="carousel-content">
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
      {/* 面试经验区块 */}
      <div className="experience-section">
        <h2 className="experience-title">精选面试经验</h2>
        <Row gutter={[24, 24]}>
          {ExperienceList.map((exp, idx) => (
            <Col span={8} key={idx}>
              <Card
                title={exp.title}
                bordered={false}
                className="experience-card"
              >
                <div className="experience-meta">
                  {exp.company} | by {exp.author}
                </div>
                <div className="experience-content">{exp.content}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
