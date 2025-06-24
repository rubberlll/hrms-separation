import React from "react";
import { Carousel } from "antd";
import { Image } from "antd";
import manage from "../assets/images/manage.jpg";
import work from "../assets/images/work.jpg";
import teamwork from "../assets/images/teamwork.jpg";
const contentStyle: React.CSSProperties = {
  margin: 0,
  height: "40px",
  lineHeight: "40px",
  textAlign: "center",
};

const WelcomeContext: React.FC = () => {
  const onChange = (currentSlide: number) => {};
  const fontStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "bold",
    textAlign: "center",
  };
  return (
    <>
      <h3 style={fontStyle}>祝您工作愉快</h3>
      <Carousel afterChange={onChange} autoplay arrows infinite={true}>
        <div>
          <Image width={"100%"} height={360} src={manage} />
          <h3 style={contentStyle}></h3>
        </div>

        <div>
          <Image width={"100%"} height={360} src={work} />
          <h3 style={contentStyle}></h3>
        </div>

        <div>
          <Image width={"100%"} height={360} src={teamwork} />
          <h3 style={contentStyle}></h3>
        </div>
      </Carousel>
    </>
  );
};

export default WelcomeContext;
