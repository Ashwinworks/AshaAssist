import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    userType: string;
    beneficiaryCategory: string;
  }) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  googleLogin: async (googleToken: string) => {
    const response = await api.post('/auth/google', { token: googleToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },
};

// Health API
export const healthAPI = {
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// ASHA Feedback API
export const ashaFeedbackAPI = {
  submit: async (payload: {
    rating: number;
    timeliness?: number;
    communication?: number;
    supportiveness?: number;
    comments?: string;
    ashaWorkerId?: string;
  }) => {
    const response = await api.post('/asha-feedback', payload);
    return response.data;
  },
  listMine: async () => {
    const response = await api.get('/asha-feedback');
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  listAllFeedback: async () => {
    const response = await api.get('/admin/asha-feedback');
    return response.data;
  }
};

// Calendar API (Asha-managed)
export const calendarAPI = {
  list: async (month?: string) => {
    const params = month ? { month } : undefined;
    const response = await api.get('/calendar-events', { params });
    return response.data;
  },
  create: async (payload: {
    title: string;
    description?: string;
    place?: string;
    start: string; // ISO
    end?: string; // ISO
    allDay?: boolean;
    category?: string;
  }) => {
    const response = await api.post('/calendar-events', payload);
    return response.data;
  },
  update: async (id: string, payload: Partial<{ title: string; description: string; place: string; start: string; end: string; allDay: boolean; category: string }>) => {
    const response = await api.put(`/calendar-events/${id}`, payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/calendar-events/${id}`);
    return response.data;
  }
};

// Maternity API
export const maternityAPI = {
  setProfile: async (payload: { lmpDate?: string; eddDate?: string }) => {
    const response = await api.put('/maternity/profile', payload);
    return response.data;
  },
  getVisits: async () => {
    const response = await api.get('/maternity/visits');
    return response.data;
  },
  addVisit: async (payload: { visitDate: string; week?: number; center?: string; notes?: string }) => {
    const response = await api.post('/maternity/visits', payload);
    return response.data;
  },
  deleteVisit: async (visitId: string) => {
    const response = await api.delete(`/maternity/visits/${visitId}`);
    return response.data;
  },
  getSchedule: async () => {
    const response = await api.get('/maternity/schedule');
    return response.data;
  },
};

export default api;