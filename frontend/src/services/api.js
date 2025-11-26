import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== Auth APIs ==========
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ========== Dashboard APIs ==========
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

// ========== Customer APIs ==========
export const customerAPI = {
  getCustomers: () => api.get('/customers'),
  getCustomerDetails: (customerId) => api.get(`/customer/${customerId}`),
  addCustomer: (data) => api.post('/customer', data),
  remindCustomer: (customerId) => api.post(`/customer/${customerId}/remind`),
  remindAllCustomers: () => api.post('/customers/remind-all'),
};

// ========== Transaction APIs ==========
export const transactionAPI = {
  getTransactions: () => api.get('/transactions'),
  createTransaction: (formData) => {
    return api.post('/transaction', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getBillImage: (transactionId) => api.get(`/transaction/${transactionId}/bill`),
};

// ========== Recurring Transaction APIs ==========
export const recurringAPI = {
  getRecurringTransactions: () => api.get('/recurring-transactions'),
  createRecurringTransaction: (data) => api.post('/recurring-transaction', data),
  toggleRecurringTransaction: (recurringId) => api.put(`/recurring-transaction/${recurringId}/toggle`),
  deleteRecurringTransaction: (recurringId) => api.delete(`/recurring-transaction/${recurringId}`),
};

// ========== Profile APIs ==========
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  regeneratePin: () => api.post('/profile/regenerate-pin'),
  getQRCode: () => api.get('/profile/qr', { responseType: 'blob' }),
};

export default api;
