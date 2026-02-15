import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
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

  checkEmailAvailability: async (email: string) => {
    const response = await api.post('/check-email', { email });
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
    // Check if we're sending form data (for file uploads)
    if (profileData instanceof FormData) {
      const response = await api.put('/profile', profileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await api.put('/profile', profileData);
      return response.data;
    }
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
  updateUserCredentials: async (id: string, payload: { email?: string; password?: string }) => {
    const response = await api.put(`/admin/users/${id}/credentials`, payload);
    return response.data;
  },
  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await api.put(`/admin/users/${id}/status`, { isActive });
    return response.data as { message: string; isActive: boolean };
  },
  // Supply Requests Management
  getSupplyRequests: async (query?: string) => {
    const url = query ? `/supply-requests${query}` : '/supply-requests';
    const response = await api.get(url);
    return response.data as { requests: any[]; pagination: { page: number; limit: number; total: number; pages: number } };
  },
  updateSupplyRequest: async (id: string, payload: { status: 'approved' | 'rejected'; reviewNotes?: string }) => {
    const response = await api.put(`/supply-requests/${id}`, payload);
    return response.data as { message: string };
  },
  // Ward Analytics
  getWardAnalytics: async () => {
    const response = await api.get('/admin/ward-analytics');
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
    date: string; // YYYY-MM-DD
    allDay?: boolean;
    category?: string;
  }) => {
    const response = await api.post('/calendar-events', payload);
    return response.data;
  },
  update: async (id: string, payload: Partial<{ title: string; description: string; place: string; date: string; allDay: boolean; category: string }>) => {
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
  },
  // Check pregnancy status for vaccination eligibility
  getPregnancyStatus: async () => {
    const response = await api.get('/profile');
    return response.data as { user: { maternalHealth?: { pregnancyStatus?: string; lmp?: string; edd?: string; deliveryDate?: string; children?: string[] } } };
  },
  // Record birth details
  recordBirth: async (birthData: {
    deliveryDate: string;
    deliveryType: 'normal' | 'c-section' | 'home';
    location: string;
    complications?: string;
    childName: string;
    childGender: 'male' | 'female';
    childWeight: number;
    childHeight: number;
  }) => {
    const response = await api.post('/maternity/record-birth', birthData);
    return response.data as { success: boolean; message: string; user: any; vaccinationsUnlocked: boolean };
  }
};

// Government Benefits API (PMSMA)
export const governmentBenefitsAPI = {
  // Get PMSMA benefit summary for current user
  getPMSMASummary: async () => {
    const response = await api.get('/benefits/pmsma/summary');
    return response.data as { hasBenefits: boolean; benefits?: any; message?: string };
  },
  // Initialize PMSMA benefits
  initializePMSMA: async (data: { confirmationDate?: string; lmp?: string }) => {
    const response = await api.post('/benefits/pmsma/initialize', data);
    return response.data;
  },
  // Mark installment as paid (ASHA worker/admin only)
  markInstallmentPaid: async (userId: string, installmentNumber: number, transactionId?: string) => {
    const response = await api.post('/benefits/pmsma/mark-paid', {
      userId,
      installmentNumber,
      transactionId
    });
    return response.data as { message: string };
  },
  // Get user's PMSMA summary (for ASHA workers viewing other users)
  getUserPMSMASummary: async (userId: string) => {
    const response = await api.get(`/benefits/pmsma/user/${userId}`);
    return response.data as { hasBenefits: boolean; benefits?: any; message?: string };
  },
  // Apply for installment (mother submits application)
  applyForInstallment: async (installmentNumber: number, applicationData?: {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    bankName: string;
  }) => {
    const response = await api.post(`/benefits/pmsma/apply/${installmentNumber}`, applicationData || {});
    return response.data as { message: string; installmentNumber: number; status: string };
  },
  // Get all maternity users (for ASHA worker PMSMA page)
  getAllMaternityUsers: async () => {
    const response = await api.get('/benefits/pmsma/mothers');
    return response.data as { mothers: any[] };
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

// Community Classes & Local Camps API (ASHA/Admin create, all list)
export const communityAPI = {
  listClasses: async (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/community-classes', { params });
    return response.data as { classes: any[] };
  },
  createClass: async (payload: {
    title: string;
    category?: string;
    date: string;
    time: string;
    location: string;
    instructor?: string;
    maxParticipants?: number;
    targetAudience?: string;
    description?: string;
    topics?: string[];
    status?: string;
  }) => {
    const response = await api.post('/community-classes', payload);
    return response.data as { message: string; class: any };
  },
  updateClass: async (id: string, payload: Partial<{ title: string; category: string; date: string; time: string; location: string; instructor: string; maxParticipants: number; registeredParticipants: number; targetAudience: string; description: string; topics: string[]; status: string }>) => {
    const response = await api.put(`/community-classes/${id}`, payload);
    return response.data as { message: string };
  },
  getClass: async (id: string) => {
    const response = await api.get(`/community-classes/${id}`);
    return response.data as { class: any };
  },
  deleteClass: async (id: string) => {
    const response = await api.delete(`/community-classes/${id}`);
    return response.data as { message: string };
  },
  listCamps: async (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/local-camps', { params });
    return response.data as { camps: any[] };
  },
  createCamp: async (payload: {
    title: string;
    campType?: string;
    date: string;
    time: string;
    location: string;
    organizer?: string;
    services?: string[];
    targetAudience?: string;
    expectedParticipants?: number;
    description?: string;
    requirements?: string;
    contactPerson?: string;
    status?: string;
  }) => {
    const response = await api.post('/local-camps', payload);
    return response.data as { message: string; camp: any };
  },
  updateCamp: async (id: string, payload: Partial<{ title: string; campType: string; date: string; time: string; location: string; organizer: string; services: string[]; targetAudience: string; expectedParticipants: number; registeredParticipants: number; description: string; requirements: string; contactPerson: string; status: string }>) => {
    const response = await api.put(`/local-camps/${id}`, payload);
    return response.data as { message: string };
  },
  getCamp: async (id: string) => {
    const response = await api.get(`/local-camps/${id}`);
    return response.data as { camp: any };
  },
  deleteCamp: async (id: string) => {
    const response = await api.delete(`/local-camps/${id}`);
    return response.data as { message: string };
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

// Supply Requests API
export const supplyAPI = {
  submitRequest: async (payload: FormData) => {
    const response = await api.post('/supply-requests', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  getUserRequests: async () => {
    const response = await api.get('/supply-requests/user');
    return response.data as { requests: any[] };
  },
  getApprovedRequests: async () => {
    const response = await api.get('/supply-requests/approved');
    console.log('API response for approved requests:', response.data);
    return response.data as { requests: any[] };
  },
  getAllRequests: async () => {
    const response = await api.get('/supply-requests');
    console.log('API response for all requests:', response.data);
    return response.data as { requests: any[] };
  },
  getScheduledRequests: async () => {
    try {
      const response = await api.get('/supply-requests/scheduled');
      console.log('API response for scheduled requests:', response.data);
      return response.data as { requests: any[] };
    } catch (error) {
      console.log('Scheduled endpoint failed, trying to get all requests and filter:', error);
      // If scheduled endpoint doesn't exist, try to get all requests and filter
      try {
        const response = await api.get('/supply-requests');
        const allRequests = response.data.requests || [];
        const scheduledRequests = allRequests.filter((req: any) =>
          req.expectedDeliveryDate || req.status === 'scheduled'
        );
        console.log('Filtered scheduled requests from all requests:', scheduledRequests);
        return { requests: scheduledRequests };
      } catch (allError) {
        console.log('All requests endpoint also failed:', allError);
        throw allError;
      }
    }
  },
  scheduleDelivery: async (requestId: string, expectedDeliveryDate: string) => {
    const response = await api.put(`/supply-requests/${requestId}/schedule`, {
      expectedDeliveryDate
    });
    return response.data as { message: string };
  },
  scheduleDeliveryWithLocation: async (requestId: string, expectedDeliveryDate: string, deliveryLocation: 'home' | 'ward', anganwadiLocationId?: string) => {
    const payload: any = {
      expectedDeliveryDate,
      deliveryLocation
    };
    if (deliveryLocation === 'ward' && anganwadiLocationId) {
      payload.anganwadiLocationId = anganwadiLocationId;
    }
    console.log('API: Scheduling delivery with payload:', payload);
    console.log('API: Request URL:', `/supply-requests/${requestId}/schedule`);

    const response = await api.put(`/supply-requests/${requestId}/schedule`, payload);
    console.log('API: Schedule delivery response:', response.data);
    return response.data as { message: string };
  },
  updateDeliveryStatus: async (requestId: string, status: 'delivered' | 'cancelled') => {
    const response = await api.put(`/supply-requests/${requestId}/status`, {
      deliveryStatus: status
    });
    return response.data as { message: string };
  }
};

// Monthly Ration API (Anganvaadi & Maternity)
export const monthlyRationAPI = {
  // Get all monthly rations for a specific month (Anganvaadi view)
  getMonthlyRations: async (monthStartDate?: string) => {
    const params = monthStartDate ? { monthStartDate } : undefined;
    const response = await api.get('/monthly-rations', { params });
    return response.data as { rations: any[]; monthStartDate: string };
  },
  // Get current user's ration status (Maternity user view)
  getMyRationStatus: async (monthStartDate?: string) => {
    const params = monthStartDate ? { monthStartDate } : undefined;
    const response = await api.get('/monthly-rations/my-status', { params });
    return response.data as { ration: any };
  },
  // Mark ration as collected
  markCollected: async (userId?: string, monthStartDate?: string) => {
    const payload: any = {};
    if (userId) payload.userId = userId;
    if (monthStartDate) payload.monthStartDate = monthStartDate;
    const response = await api.put('/monthly-rations/mark-collected', payload);
    return response.data as { message: string };
  },
  // Mark ration as pending (undo collection) - Anganvaadi only
  markPending: async (userId: string, monthStartDate?: string) => {
    const payload: any = { userId };
    if (monthStartDate) payload.monthStartDate = monthStartDate;
    const response = await api.put('/monthly-rations/mark-pending', payload);
    return response.data as { message: string };
  },
  // Get ration history for all months (Anganvaadi only)
  getRationHistory: async () => {
    const response = await api.get('/monthly-rations/history');
    return response.data as { rations: any[] };
  }
};

// Locations API
export const locationsAPI = {
  // Get all active locations
  getLocations: async (ward?: string) => {
    const params = ward ? { ward } : undefined;
    const response = await api.get('/locations', { params });
    return response.data as { locations: any[] };
  },
  // Create location (admin only)
  createLocation: async (payload: {
    name: string;
    type: string;
    ward: string;
    address?: string;
  }) => {
    const response = await api.post('/locations', payload);
    return response.data as { id: string; message: string };
  },
  // Update location (admin only)
  updateLocation: async (id: string, payload: Partial<{
    name: string;
    type: string;
    ward: string;
    address: string;
    active: boolean;
  }>) => {
    const response = await api.put(`/locations/${id}`, payload);
    return response.data as { message: string };
  },
  // Delete location (admin only)
  deleteLocation: async (id: string) => {
    const response = await api.delete(`/locations/${id}`);
    return response.data as { message: string };
  }
};

// Anganvaadi Dashboard API
export const anganvaadiAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/anganvaadi/dashboard-stats');
    return response.data as {
      stats: {
        vaccinationsScheduled: number;
        classesToday: number;
        rationDistributions: number;
        campsThisWeek: number;
      };
      updates: Array<{
        type: string;
        title: string;
        message: string;
        color: string;
      }>;
    };
  }
};

// Home Visits API
export const homeVisitsAPI = {
  // Get users for home visits (ASHA worker)
  getUsersForVisits: async () => {
    const response = await api.get('/home-visits/users');
    return response.data as { users: any[] };
  },
  // Record a home visit with geotagged photo
  recordVisit: async (formData: FormData) => {
    const response = await api.post('/home-visits', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data as { message: string; visitId: string };
  },
  // Get my visits (ASHA worker)
  getMyVisits: async (params?: { userId?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await api.get('/home-visits/my-visits', { params });
    return response.data as { visits: any[] };
  },
  // Get all visits (Admin)
  getAllVisits: async (params?: {
    ashaWorkerId?: string;
    userCategory?: string;
    verified?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get('/home-visits/all', { params });
    return response.data as { visits: any[] };
  },
  // Verify a visit (Admin)
  verifyVisit: async (visitId: string, verified: boolean, adminNotes?: string) => {
    const response = await api.put(`/home-visits/${visitId}/verify`, {
      verified,
      adminNotes
    });
    return response.data as { message: string };
  },
  // Get visit statistics (Admin)
  getVisitStats: async () => {
    const response = await api.get('/home-visits/stats');
    return response.data as {
      totalVisitsThisMonth: number;
      verifiedVisits: number;
      pendingVerification: number;
      maternityVisits: number;
      palliativeVisits: number;
    };
  }
};

// Milestones API
export const milestonesAPI = {
  // Get all milestones
  getAllMilestones: async () => {
    const response = await api.get('/milestones');
    return response.data as { milestones: any[] };
  },
  // Get user's milestone progress
  getMyProgress: async () => {
    const response = await api.get('/milestones/my-progress');
    return response.data as { milestones: any[]; childAgeMonths: number | null };
  },
  // Record a milestone achievement
  recordMilestone: async (data: {
    milestoneId: string;
    achievedDate: string;
    notes?: string;
    photoUrl?: string;
  }) => {
    const response = await api.post('/milestones/record', data);
    return response.data as { message: string; recordId: string };
  },
  // Update a milestone record
  updateMilestoneRecord: async (recordId: string, data: {
    achievedDate?: string;
    notes?: string;
    photoUrl?: string;
  }) => {
    const response = await api.put(`/milestones/record/${recordId}`, data);
    return response.data as { message: string };
  },
  // Delete a milestone record
  deleteMilestoneRecord: async (recordId: string) => {
    const response = await api.delete(`/milestones/record/${recordId}`);
    return response.data as { message: string };
  },
  // Upload milestone photo
  uploadMilestonePhoto: async (formData: FormData) => {
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data as { fileUrl: string };
  },
  // ASHA Worker endpoints
  getMaternalUsersMilestones: async () => {
    const response = await api.get('/milestones/asha/maternal-users');
    return response.data as { users: any[] };
  },
  getUserMilestoneDetails: async (userId: string) => {
    const response = await api.get(`/milestones/asha/user/${userId}`);
    return response.data as { user: any; milestones: any[] };
  },
  verifyMilestone: async (recordId: string, verificationStatus: string, notes?: string) => {
    const response = await api.put(`/milestones/asha/verify/${recordId}`, {
      verificationStatus,
      notes
    });
    return response.data as { message: string };
  }
};

// Maternity Dashboard API
export const maternityDashboardAPI = {
  getStats: async () => {
    try {
      console.log('Fetching maternity dashboard stats...');

      // Fetch visits data
      let visits: any[] = [];
      try {
        const visitsResponse = await maternityAPI.getVisits();
        visits = visitsResponse.visits || [];
        console.log('Visits data:', visits);
      } catch (visitsError) {
        console.log('Failed to fetch visits:', visitsError);
        visits = [];
      }

      // Fetch supply requests
      let supplyRequests: any[] = [];
      try {
        const supplyResponse = await supplyAPI.getUserRequests();
        supplyRequests = supplyResponse.requests || [];
        console.log('Supply requests data:', supplyRequests);
      } catch (supplyError) {
        console.log('Failed to fetch supply requests:', supplyError);
        supplyRequests = [];
      }

      // Fetch monthly ration status
      let rationStatus: any = null;
      try {
        const rationResponse = await monthlyRationAPI.getMyRationStatus();
        rationStatus = rationResponse.ration || null;
        console.log('Ration status:', rationStatus);
      } catch (rationError) {
        console.log('Failed to fetch ration status:', rationError);
        rationStatus = null;
      }

      // Fetch vaccination records
      let vaccinationRecords: any[] = [];
      try {
        const vaccinationResponse = await vaccinationAPI.listMyRecords();
        vaccinationRecords = vaccinationResponse.records || [];
        console.log('Vaccination records:', vaccinationRecords);
      } catch (vaccinationError) {
        console.log('Failed to fetch vaccination records:', vaccinationError);
        vaccinationRecords = [];
      }

      // Fetch calendar events
      let calendarEvents: any[] = [];
      try {
        const calendarResponse = await calendarAPI.list();
        calendarEvents = calendarResponse.events || calendarResponse || [];
        console.log('Calendar events:', calendarEvents);
      } catch (calendarError) {
        console.log('Failed to fetch calendar events:', calendarError);
        calendarEvents = [];
      }

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingAppointments = visits.filter((visit: any) => {
        if (!visit.visitDate) return false;
        try {
          const visitDate = new Date(visit.visitDate);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate >= today;
        } catch (e) {
          return false;
        }
      }).length;

      const pendingRequests = supplyRequests.filter((req: any) =>
        req.status === 'pending'
      ).length;

      const completedVisits = visits.filter((visit: any) => {
        if (!visit.visitDate) return false;
        try {
          const visitDate = new Date(visit.visitDate);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate < today;
        } catch (e) {
          return false;
        }
      }).length;

      // Get next vaccination date
      let nextVaccination: any = null;
      if (vaccinationRecords.length > 0) {
        // Filter for scheduled vaccinations
        const scheduledVaccinations = vaccinationRecords.filter((record: any) =>
          record.status === 'Scheduled' && record.date
        );

        if (scheduledVaccinations.length > 0) {
          // Sort by date and get the earliest
          scheduledVaccinations.sort((a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          nextVaccination = scheduledVaccinations[0];
        }
      }

      // Get upcoming calendar events (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const upcomingEvents = calendarEvents.filter((event: any) => {
        if (!event.date) return false;
        try {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= nextWeek;
        } catch (e) {
          return false;
        }
      }).slice(0, 3); // Limit to 3 events

      console.log('Calculated stats:', {
        upcomingAppointments,
        pendingRequests,
        completedVisits,
        rationStatus,
        nextVaccination,
        upcomingEvents
      });

      return {
        upcomingAppointments,
        pendingRequests,
        completedVisits,
        rationStatus,
        nextVaccination,
        upcomingEvents
      };
    } catch (error) {
      console.error('Error fetching maternity dashboard stats:', error);
      return {
        upcomingAppointments: 0,
        pendingRequests: 0,
        completedVisits: 0,
        rationStatus: null,
        nextVaccination: null,
        upcomingEvents: []
      };
    }
  }
};

// Palliative Dashboard API
export const palliativeDashboardAPI = {
  getStats: async () => {
    try {
      console.log('Fetching palliative dashboard stats...');

      // Fetch health records
      let records: any[] = [];
      try {
        const recordsResponse = await palliativeAPI.listRecords();
        records = recordsResponse.records || [];
        console.log('Health records data:', records);
      } catch (recordsError) {
        console.log('Failed to fetch health records:', recordsError);
        records = [];
      }

      // Fetch visit requests
      let visitRequests: any[] = [];
      try {
        const visitResponse = await api.get('/visit-requests');
        visitRequests = visitResponse.data.requests || [];
        console.log('Visit requests data:', visitRequests);
      } catch (visitError) {
        console.log('Failed to fetch visit requests:', visitError);
        visitRequests = [];
      }

      // Fetch supply requests
      let supplyRequests: any[] = [];
      try {
        const supplyResponse = await supplyAPI.getUserRequests();
        supplyRequests = supplyResponse.requests || [];
        console.log('Supply requests data:', supplyRequests);
      } catch (supplyError) {
        console.log('Failed to fetch supply requests:', supplyError);
        supplyRequests = [];
      }

      // Fetch calendar events
      let calendarEvents: any[] = [];
      try {
        const calendarResponse = await calendarAPI.list();
        calendarEvents = calendarResponse.events || calendarResponse || [];
        console.log('Calendar events:', calendarEvents);
      } catch (calendarError) {
        console.log('Failed to fetch calendar events:', calendarError);
        calendarEvents = [];
      }

      const upcomingAppointments = visitRequests.filter((req: any) =>
        req.status === 'scheduled' || req.status === 'approved'
      ).length;

      const pendingRequests = supplyRequests.filter((req: any) =>
        req.status === 'pending'
      ).length;

      const careVisits = records.length;

      // Get upcoming calendar events (next 7 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const upcomingEvents = calendarEvents.filter((event: any) => {
        if (!event.date) return false;
        try {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= nextWeek;
        } catch (e) {
          return false;
        }
      }).slice(0, 3); // Limit to 3 events

      // Get recent health records (last 3)
      const recentRecords = [...records]
        .sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.createdAt);
          const dateB = new Date(b.date || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

      console.log('Calculated stats:', {
        upcomingAppointments,
        pendingRequests,
        careVisits,
        upcomingEvents,
        recentRecords
      });

      return {
        upcomingAppointments,
        pendingRequests,
        careVisits,
        upcomingEvents,
        recentRecords
      };
    } catch (error) {
      console.error('Error fetching palliative dashboard stats:', error);
      return {
        upcomingAppointments: 0,
        pendingRequests: 0,
        careVisits: 0,
        upcomingEvents: [],
        recentRecords: []
      }
    }
  }
};

// Chat API (Mistral AI Copilot)
export const chatAPI = {
  sendMessage: async (message: string) => {
    const response = await api.post('/chat', { message });
    return response.data as { reply: string };
  }
};
