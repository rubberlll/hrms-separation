import React from "react";
import { Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "./index.less";

const bannerData = [
  {
    title: "岗位投递",
    subtitle: "一键投递，快速入职",
    desc: "海量岗位，一键投递，助你高效找到心仪工作。",
  },
  {
    title: "简历制作",
    subtitle: "生成简历，提升竞争力",
    desc: "markdown编辑，极简模版，让你的简历出彩。",
  },
  {
    title: "企业管理",
    subtitle: "高效管理，人才无忧",
    desc: "企业专属后台，招聘、管理一站式解决。",
  },
];

const HeroBanner: React.FC = () => (
  <div className="hero-banner-slide hero-banner-multi">
    {bannerData.map((item, idx) => (
      <React.Fragment key={idx}>
        <div className="hero-banner-card">
          <h1 className="hero-banner-title">{item.title}</h1>
          <h2 className="hero-banner-subtitle">{item.subtitle}</h2>
          <p className="hero-banner-desc">{item.desc}</p>
        </div>
        {idx < bannerData.length - 1 && (
          <div className="hero-banner-arrow">
            <RightOutlined />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default HeroBanner;
