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
const ApplyPage = lazy(() => import("../pages/Apply"));
const MyApplications = lazy(() => import("../pages/myApplication"));
const PermissionManagement = lazy(
  () => import("../pages/PermissionManagement")
);
const Department = lazy(() => import("../pages/department"));
const UserCenter = lazy(() => import("../pages/userCenter/index"));
const SearchResult = lazy(() => import("../pages/search"));
const PostManage = lazy(() => import("../pages/post"));
const ResumeMaker = lazy(() => import("../pages/ResumeMaker"));
const Register = lazy(() => import("../pages/register/index"));
const AccountSetting = lazy(() => import("../pages/account/AccountSetting"));

import CLayout from "../layouts/CLayout";
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));

const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
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
    path: "/jobs",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <CLayout>
          <ApplyPage />
        </CLayout>
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
    path: "/my-applications",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <CLayout>
          <MyApplications />
        </CLayout>
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
    path: "/search",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <CLayout>
          <SearchResult />
        </CLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/post-manage",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee", "user"]}>
        <CLayout>
          <PostManage />
        </CLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/resume-maker",
    element: (
      <PrivateRoute roles={["admin", "hr", "user", "employee"]}>
        <ResumeMaker />
      </PrivateRoute>
    ),
  },
  {
    path: "/account/setting",
    element: <AccountSetting />,
  },
  {
    path: "/admin",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee"]}>
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/candidates",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee"]}>
        <AdminLayout>
          <Resume />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/permission-management",
    element: (
      <PrivateRoute roles={["admin", "hr", "employee"]}>
        <AdminLayout>
          <PermissionManagement />
        </AdminLayout>
      </PrivateRoute>
    ),
  },
  {
    path: "/admin/setting",
    element: (
      <AdminLayout>
        <AccountSetting />
      </AdminLayout>
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
