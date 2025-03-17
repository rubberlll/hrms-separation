import { create } from "zustand";
import request from "../utils/request";

interface Job {
  _id: string;
  title: string;
  department: any;
  description: string;
  location: string;
  salaryRange?: string;
  status: "open" | "closed" | "archived";
  jobType?: string;
  expiryDate?: string;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface JobStore {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  addJob: (job: Omit<Job, "_id">) => Promise<Job>;
  updateJob: (id: string, job: Partial<Job>) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  loading: false,
  error: null,

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await request.get("/jobs");
      set({ jobs: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addJob: async (job) => {
    set({ loading: true, error: null });
    try {
      const response = await request.post("/jobs", job);
      const newJob = response.data.data;
      set((state) => ({ jobs: [newJob, ...state.jobs], loading: false }));
      return newJob;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateJob: async (id, job) => {
    set({ loading: true, error: null });
    try {
      const response = await request.put(`/jobs/${id}`, job);
      const updatedJob = response.data.data;
      set((state) => ({
        jobs: state.jobs.map((j) => (j._id === id ? updatedJob : j)),
        loading: false,
      }));
      return updatedJob;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteJob: async (id) => {
    set({ loading: true, error: null });
    try {
      await request.delete(`/jobs/${id}`);
      set((state) => ({
        jobs: state.jobs.filter((job) => job._id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
