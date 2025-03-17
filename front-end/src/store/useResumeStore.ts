import { create } from "zustand";
import request from "../utils/request";
import { ApiResponse } from "../types/api";

export interface Resume {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  education: {
    school: string;
    major: string;
    degree: string;
    graduationYear: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  fileUrl: string;
  submitTime: string;
}

interface ResumeStore {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  fetchResumes: () => Promise<void>;
  uploadResume: (formData: FormData) => Promise<string>;
  submitResume: (resume: Omit<Resume, "id" | "submitTime">) => Promise<void>;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  loading: false,
  error: null,

  fetchResumes: async () => {
    set({ loading: true, error: null });
    try {
      const { data: response } = await request.get<ApiResponse<Resume[]>>(
        "/api/recruitment/resume"
      );
      if (response.code === 200) {
        set({ resumes: response.data });
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  uploadResume: async (formData) => {
    set({ loading: true, error: null });
    try {
      const { data: response } = await request.post<
        ApiResponse<{ url: string }>
      >("/api/upload", formData);
      if (response.code === 200) {
        return response.data.url;
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

  submitResume: async (resume) => {
    set({ loading: true, error: null });
    try {
      const { data: response } = await request.post<ApiResponse<Resume>>(
        "/api/recruitment/resume",
        resume
      );
      if (response.code === 200) {
        set((state) => ({
          resumes: [...state.resumes, response.data],
        }));
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
