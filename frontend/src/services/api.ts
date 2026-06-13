import axios from 'axios';
import { User, Session, Recording, SessionStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: any) => api.post<{ token: string; user: User }>('/auth/login', credentials),
  me: () => api.get<User>('/auth/me'),
};

export const sessionApi = {
  createSession: (data: any) => api.post<Session>('/sessions', data),
  getSession: (id: string) => api.get<Session>(`/sessions/${id}`),
  getSessionByInviteToken: (token: string) => api.get<Session>(`/sessions/invite/${token}`),
  joinSession: (id: string, data: any) => api.post<Session>(`/sessions/${id}/join`, data),
  endSession: (id: string) => api.post<Session>(`/sessions/${id}/end`),
  forceEndSession: (id: string) => api.post<Session>(`/sessions/${id}/force-end`),
  getSessionHistory: () => api.get<Session[]>('/sessions/history'),
  getAdminLiveSessions: () => api.get<Session[]>('/admin/sessions/live'),
  getAdminHistory: () => api.get<Session[]>('/admin/sessions/history'),
};

export const recordingApi = {
  startRecording: (sessionId: string) => api.post<{ recordingId: string }>(`/sessions/${sessionId}/recording/start`),
  stopRecording: (sessionId: string) => api.post(`/sessions/${sessionId}/recording/stop`),
  getAdminRecordings: () => api.get<Recording[]>('/admin/recordings'),
};

export const fileApi = {
  uploadFile: async (sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/sessions/${sessionId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
