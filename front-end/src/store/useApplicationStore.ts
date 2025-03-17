import { create } from "zustand";
import request from "../utils/request";
import { ApiResponse } from "../types/api";

export interface Application {
  id: string;
  position: string;
  applyDate: string;
  status: string;
}

interface ApplicationStore {
  applications: Application[];
  loading: boolean;
  error: string | null;
  fetchApplications: () => Promise<void>;
  submitApplication: (data: {
    position: string;
    resumeId: string;
    coverLetter?: string;
  }) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const { data: response } = await request.get<ApiResponse<Application[]>>(
        "/api/recruitment/my-applications"
      );
      if (response.code === 200) {
        set({ applications: response.data });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  submitApplication: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: response } = await request.post<ApiResponse<void>>(
        "/api/recruitment/apply",
        data
      );
      if (response.code === 200) {
        // 提交成功后刷新申请列表
        const store = useApplicationStore.getState();
        await store.fetchApplications();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
