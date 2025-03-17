import { create } from "zustand";
import { persist } from "zustand/middleware";
import request from "../utils/request";

interface UserInfo {
  userId: string;
  name: string;
  role: "admin" | "hr" | "employee" | "user";
  email: string;
  username: string;
  phone?: string;
  status: "active" | "inactive" | "pending";
  department?: string;
  avatar?: string;
  entryDate?: string;
  employmentType?: "全职" | "兼职" | "实习";
}

interface LoginStore {
  token: string;
  userInfo: UserInfo | null;
  isLogin: boolean;
  setLogin: (userData: {
    username: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string }>;
  verifyToken: () => Promise<boolean>;
  logout: () => void;
}

export const useLoginStore = create<LoginStore>()(
  persist(
    (set) => ({
      token: localStorage.getItem("token") || "",
      userInfo: JSON.parse(localStorage.getItem("userInfo") || "null"),
      isLogin: !!localStorage.getItem("token"),

      setLogin: async (userData) => {
        try {
          const response = await request.post("/login", userData);
          if (response.data.code === 200) {
            const { token, userInfo } = response.data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("userInfo", JSON.stringify(userInfo));

            set({
              token,
              userInfo,
              isLogin: true,
            });

            return { success: true };
          } else {
            return {
              success: false,
              message: response.data.message || "登录失败",
            };
          }
        } catch (error: any) {
          console.error("登录失败:", error.message);
          return {
            success: false,
            message:
              error.response?.data?.message || error.message || "登录请求失败",
          };
        }
      },

      verifyToken: async () => {
        try {
          const response = await request.get("/verify-token");
          const isValid = response.data.code === 200;

          if (!isValid) {
            useLoginStore.getState().logout();
          }

          return isValid;
        } catch (error: any) {
          console.error("token验证失败:", error.message);
          useLoginStore.getState().logout();
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        set({ token: "", userInfo: null, isLogin: false });
      },
    }),
    {
      name: "login-storage",
      partialize: (state) => ({ token: state.token, userInfo: state.userInfo }),
    }
  )
);
