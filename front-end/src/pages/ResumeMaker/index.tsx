import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { Spin } from "antd";
import "./index.less";

const ResumeMaker: React.FC = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div className="resume-maker-standalone">
      <Navbar />
      <div
        className="resume-maker-iframe-wrapper"
        style={{ position: "relative", marginTop: 68 }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff",
            }}
          >
            <Spin size="large" tip="加载中..." />
          </div>
        )}
        <iframe
          src="https://www.rubbercv.xyz/"
          title="在线简历制作"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

export default ResumeMaker;
