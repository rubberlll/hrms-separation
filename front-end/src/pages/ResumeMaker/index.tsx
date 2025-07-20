import React from "react";
import Navbar from "../../components/Navbar";
import "./index.less";

const ResumeMaker: React.FC = () => {
  return (
    <div className="resume-maker-standalone">
      <Navbar />
      <div className="resume-maker-iframe-wrapper">
        <iframe
          src="https://www.rubbercv.xyz/"
          title="在线简历制作"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ResumeMaker;
