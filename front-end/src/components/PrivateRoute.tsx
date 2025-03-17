import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLoginStore } from "@/store/useLoginStore";
import { hasPermission } from "@/config/permissions";

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLogin, userInfo, verifyToken } = useLoginStore();
  const location = useLocation();

  // 组件挂载时验证token有效性
  useEffect(() => {
    if (isLogin) {
      verifyToken();
    }
  }, [isLogin, verifyToken]);

  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 确保userInfo存在
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查用户是否有权限访问当前路由
  const hasRoutePermission = hasPermission(userInfo.role, location.pathname);

  if (!hasRoutePermission) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
