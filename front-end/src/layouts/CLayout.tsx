import React, { PropsWithChildren } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import "./CLayout.less";

const CLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="clayout-container">
    <Navbar />
    <div className="clayout-content">{children ? children : <Outlet />}</div>
  </div>
);

export default CLayout;
