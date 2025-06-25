import { Suspense } from "react";
import { Spin } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ConfigProvider, theme } from "antd";
import { useThemeStore } from "./store/useThemeStore";
import React from "react";
function App() {
  const { isDarkMode } = useThemeStore();

  return (
    <ConfigProvider
      theme={{
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
