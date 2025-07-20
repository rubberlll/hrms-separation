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
const UserCenter = lazy(() => import("../pages/userCenter/index"));

import CLayout from "../layouts/CLayout";

const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <CLayout>
          <Home />
        </CLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/user",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <User />
      </PrivateRoute>
    ),
  },
  {
    path: "/user-center",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <CLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <UserCenter />,
      },
      {
        path: ":id",
        element: <UserCenter />,
      },
    ],
  },
  {
    path: "/recruitment/resume",
    element: (
      <PrivateRoute roles={["admin", "hr", "user"]}>
        <Resume />
      </PrivateRoute>
    ),
  },
  {
    path: "/recruitment/jobs",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <Job />
      </PrivateRoute>
    ),
  },
  {
    path: "/recruitment/apply",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <ApplyPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/recruitment/my-applications",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <MyApplications />
      </PrivateRoute>
    ),
  },
  {
    path: "/permission-management",
    element: (
      <PrivateRoute roles={["admin"]}>
        <PermissionManagement />
      </PrivateRoute>
    ),
  },
  {
    path: "/department",
    element: (
      <PrivateRoute roles={["admin", "hr"]}>
        <Department />
      </PrivateRoute>
    ),
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
