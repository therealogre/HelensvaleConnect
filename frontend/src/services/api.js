import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  logout: () => api.get('/auth/logout'),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params = {}) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (vendorData) => api.post('/vendors', vendorData),
  update: (id, vendorData) => api.put(`/vendors/${id}`, vendorData),
  delete: (id) => api.delete(`/vendors/${id}`),
  getByLocation: (radius, zipcode) => api.get(`/vendors/location/${radius}/${zipcode}`),
  uploadPhoto: (id, formData) => api.put(`/vendors/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  checkIn: (id, location) => api.put(`/bookings/${id}/checkin`, { location }),
  addFeedback: (id, feedback) => api.put(`/bookings/${id}/feedback`, feedback),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
