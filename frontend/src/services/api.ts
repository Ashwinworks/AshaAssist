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
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401) {
      // Skip redirect for auth endpoints so UI can show proper error messages
      const isAuthEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/auth/google');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  },
  getAshaOverview: async (): Promise<{
    worker: { id: string; name: string; email: string; phone: string; ward: string; isActive: boolean; createdAt?: string; lastLogin?: string };
    stats: { totalFeedbacks: number; averageRating: number; complaintsReceived: number };
  }> => {
    const response = await api.get('/admin/asha-overview');
    return response.data;
  },
  getVaccinationOverview: async (): Promise<{ schedules: Array<{ id: string; title: string; date?: string; time?: string; location?: string; vaccines: string[]; status: string; stats: { totalBookings: number; booked: number; completed: number; expired: number; cancelled: number } }> }> => {
    const response = await api.get('/admin/vaccination-overview');
    return response.data;
  },
  // Users Management
  listUsers: async (params?: { q?: string; type?: string; category?: string; status?: 'active' | 'inactive'; page?: number; pageSize?: number }) => {
    const response = await api.get('/admin/users', { params });
    return response.data as { users: any[]; total: number; page: number; pageSize: number };
  },
  getUser: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data as { user: any };
  },
  updateUser: async (id: string, payload: Partial<{ name: string; phone: string; beneficiaryCategory: string; isActive: boolean }>) => {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data;
  },
  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive });
    return response.data as { message: string; isActive: boolean };
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
  getAllRecords: async (params?: { 
    userName?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }) => {
    const response = await api.get('/maternity/records/all', { params });
    return response.data as { records: any[] };
  }
};

// Vaccination schedules & bookings
export const vaccinationAPI = {
  // ASHA/Admin creation
  createSchedule: async (payload: { title?: string; date: string; time?: string; location: string; vaccines: string[]; description?: string }) => {
    const response = await api.post('/vaccination-schedules', payload);
    return response.data;
  },
  // List for all users
  listSchedules: async (params?: { fromDate?: string }) => {
    const response = await api.get('/vaccination-schedules', { params });
    return response.data as { schedules: any[] };
  },
  // Get single schedule
  getSchedule: async (id: string) => {
    const response = await api.get(`/vaccination-schedules/${id}`);
    return response.data as { schedule: any };
  },
  // Update schedule (ASHA/Admin)
  updateSchedule: async (
    id: string,
    payload: Partial<{ title: string; date: string; time: string; location: string; vaccines: string[]; description: string; status: string }>
  ) => {
    const response = await api.put(`/vaccination-schedules/${id}`, payload);
    return response.data;
  },
  // User booking
  book: async (scheduleId: string, payload: { childName: string; vaccines: string[] }) => {
    const response = await api.post(`/vaccination-schedules/${scheduleId}/bookings`, payload);
    return response.data;
  },
  // List bookings for a schedule (ASHA sees all, user sees own)
  listBookings: async (scheduleId: string) => {
    const response = await api.get(`/vaccination-schedules/${scheduleId}/bookings`);
    return response.data as { bookings: any[] };
  },
  // Update booking status (ASHA/Admin only)
  updateBookingStatus: async (bookingId: string, status: string) => {
    const response = await api.put(`/vaccination-bookings/${bookingId}/status`, { status });
    return response.data;
  },
  // My completed vaccination records for MCP card
  listMyRecords: async (): Promise<{ records: Array<{ id: string; vaccines: string[]; childName?: string; status: string; date?: string; location?: string; createdAt?: string }> }> => {
    const response = await api.get('/vaccination-records');
    return response.data;
  },
  // Download vaccination certificate
  downloadCertificate: async (bookingId: string) => {
    const response = await api.get(`/vaccination-certificate/${bookingId}`, { responseType: 'blob' });
    return response;
  },
  // Get all vaccination records (for ASHA workers)
  getAllRecords: async (params?: { 
    userName?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    status?: string;
  }) => {
    const response = await api.get('/vaccination/records/all', { params });
    return response.data as { records: any[] };
  }
};

// Health Blogs API
export const healthBlogsAPI = {
  create: async (payload: {
    title: string;
    content: string;
    category?: 'maternity' | 'palliative' | 'general';
    authorName: string;
    status?: 'published' | 'draft';
    imageFile?: File | null;
    tags?: string[];
  }) => {
    // Use multipart if image is present
    if (payload.imageFile) {
      const form = new FormData();
      form.append('title', payload.title);
      form.append('content', payload.content);
      form.append('authorName', payload.authorName);
      form.append('category', payload.category || 'general');
      form.append('status', payload.status || 'published');
      if (payload.tags) form.append('tags', JSON.stringify(payload.tags));
      form.append('image', payload.imageFile);
      const response = await api.post('/health-blogs', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await api.post('/health-blogs', {
      title: payload.title,
      content: payload.content,
      authorName: payload.authorName,
      category: payload.category || 'general',
      status: payload.status || 'published',
      tags: payload.tags || [],
    });
    return response.data;
  },
  list: async (params?: { category?: string; status?: string; createdBy?: string }) => {
    const response = await api.get('/health-blogs', { params });
    return response.data as { blogs: any[] };
  },
  get: async (id: string) => {
    const response = await api.get(`/health-blogs/${id}`);
    return response.data as { blog: any };
  },
  update: async (id: string, payload: Partial<{ title: string; content: string; authorName: string; category: string; status: string; tags: string[] }>) => {
    const response = await api.put(`/health-blogs/${id}`, payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/health-blogs/${id}`);
    return response.data;
  }
};

// Palliative Records API
export const palliativeAPI = {
  listRecords: async (params?: { testType?: string }) => {
    const response = await api.get('/palliative/records', { params });
    return response.data as { records: any[] };
  },
  createRecord: async (payload: FormData | {
    date: string;
    testType: string;
    notes?: string;
    value?: number;
    unit?: string;
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    subvalues?: Record<string, number | string>;
    files?: File[];
  }) => {
    if (payload instanceof FormData) {
      const response = await api.post('/palliative/records', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      return response.data;
    }
    // Fallback JSON
    const response = await api.post('/palliative/records', payload);
    return response.data;
  },
  deleteRecord: async (id: string) => {
    const response = await api.delete(`/palliative/records/${id}`);
    return response.data as { message: string };
  },
  getAllRecords: async (params?: { 
    testType?: string; 
    userName?: string; 
    dateFrom?: string; 
    dateTo?: string; 
  }) => {
    const response = await api.get('/palliative/records/all', { params });
    return response.data as { records: any[] };
  }
};

export default api;