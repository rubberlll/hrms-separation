import axios, { AxiosResponse, AxiosError } from "axios";
import { message } from "antd";
import { useLoginStore } from "../store/useLoginStore";

interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加这行代码来记录完整的请求 URL
    console.log("请求发送到:", config.baseURL + config.url);

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    // 检查是否有 success 字段（兼容旧 API 格式）
    if (response.data.success === true) {
      return response;
    }

    const { code, message: msg, data } = response.data;

    // 请求成功
    if (code === 200 || code === 201) {
      return response;
    }

    // 处理其他状态码
    message.error(msg || "请求失败");
    return Promise.reject(new Error(msg || "请求失败"));
  },
  (error: AxiosError<ResponseData>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // token过期或无效
          useLoginStore.getState().logout();
          window.location.href = "/login";
          message.error("登录已过期，请重新登录");
          break;
        case 403:
          message.error("没有权限访问");
          break;
        case 404:
          message.error("请求的资源不存在");
          break;
        case 500:
          message.error("服务器错误");
          break;
        default:
          message.error(data?.message || "请求失败");
      }
    } else if (error.request) {
      message.error("网络错误，请检查网络连接");
    } else {
      message.error("请求配置错误");
    }

    return Promise.reject(error);
  }
);

export default request;
