import React from "react";
import { Breadcrumb } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

interface CustomBreadcrumbProps {
  routeMap: Record<string, string>;
}

const CustomBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ routeMap }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    let currentLink = "";
    const breadcrumbItems = [
      {
        title: "首页",
        onClick: () => navigate("/"),
      },
    ];

    for (let i = 0; i < pathSegments.length; i++) {
      currentLink += `/${pathSegments[i]}`;
      const title = routeMap[currentLink];
      if (title) {
        breadcrumbItems.push({
          title: title,
          onClick: () => navigate(currentLink),
        });
      }
    }

    return breadcrumbItems;
  };

  return <Breadcrumb items={getBreadcrumbItems()} />;
};

export default CustomBreadcrumb;
