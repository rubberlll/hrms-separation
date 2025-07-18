import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLoginStore } from "../store/useLoginStore";
import { hasPermission } from "../config/permissions";

interface PrivateRouteProps {
  children: React.ReactElement;
  roles?: string[]; // 新增：允许的角色
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
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

  // 新增：如果传入了roles属性，优先生效
  if (roles && !roles.includes(userInfo.role)) {
    return <Navigate to="/403" replace />;
  }

  // 如果没有传roles，走原有的hasPermission逻辑
  if (!roles) {
    const hasRoutePermission = hasPermission(userInfo.role, location.pathname);
    if (!hasRoutePermission) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
