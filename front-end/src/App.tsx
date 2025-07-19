import { Suspense } from "react";
import { Spin } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ConfigProvider, theme } from "antd";
import { useThemeStore } from "./store/useThemeStore";
import React from "react";
import "./styles/antd-theme.less";
function App() {
  const { isDarkMode } = useThemeStore();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff5c10",
        },
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Suspense
        fallback={
          <Spin
            tip="加载中..."
            size="large"
            style={{ width: "100%", marginTop: "20vh" }}
          />
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
