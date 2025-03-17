import { createBrowserRouter } from "react-router-dom";
import React, { JSX } from "react";
import { lazy } from "react";

const Login = lazy(() => import("../pages/login/Login"));
const Home = lazy(() => import("../pages/home/Home"));

const Welcome = lazy(() => import("../pages/Welcome"));
const User = lazy(() => import("../pages/User"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Forbidden = lazy(() => import("../pages/Forbidden"));

import PrivateRoute from "../components/PrivateRoute";
const Resume = lazy(() => import("../pages/Resume"));
const Job = lazy(() => import("../pages/Job"));
const ApplyPage = lazy(() => import("../pages/recruitment/Apply"));
const MyApplications = lazy(
  () => import("../pages/recruitment/MyApplications")
);
const PermissionManagement = lazy(
  () => import("../pages/PermissionManagement")
);
const Department = lazy(() => import("../pages/department"));

const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: <PrivateRoute children={<Home />} />,
    children: [
      {
        index: true,
        Component: Welcome,
      },

      {
        path: "user",
        Component: User,
      },
      {
        path: "/recruitment/resume",
        Component: Resume,
      },
      {
        path: "/recruitment/jobs",
        Component: Job,
      },
      {
        path: "/recruitment/apply",
        element: <ApplyPage />,
      },
      {
        path: "/recruitment/my-applications",
        element: <MyApplications />,
      },
      {
        path: "/permission-management",
        element: <PermissionManagement />,
      },
      {
        path: "/department",
        element: <Department />,
      },
    ],
  },
  {
    path: "/403",
    Component: Forbidden,
  },
  {
    path: "/notfound",
    Component: NotFound,
  },
]);

export default router;
