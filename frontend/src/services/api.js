/**
 * API Service - Handles all API calls to the Business backend
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kathape-react-business.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
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

// Response interceptor - Handle errors
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

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Dashboard APIs
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  getSummary: () => api.get('/business/summary'),
};

// Customer APIs
export const customerAPI = {
  getCustomers: () => api.get('/customers'),
  getCustomer: (id) => api.get(`/customer/${id}`),
  addCustomer: (data) => api.post('/customer/add', data),
  updateCustomer: (id, data) => api.put(`/customer/${id}/update`, data),
  deleteCustomer: (id) => api.delete(`/customer/${id}/delete`),
  searchCustomers: (query) => api.get(`/customers/search?q=${query}`),
};

// Transaction APIs
export const transactionAPI = {
  createTransaction: (data) => {
    // If data contains a file, use FormData
    if (data.bill_photo) {
      const formData = new FormData();
      formData.append('customer_id', data.customer_id);
      formData.append('type', data.transaction_type);
      formData.append('amount', data.amount);
      formData.append('notes', data.notes || '');
      formData.append('bill_image', data.bill_photo);
      
      return api.post('/transaction', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // When no file, send JSON but map transaction_type to type
    return api.post('/transaction', {
      customer_id: data.customer_id,
      type: data.transaction_type,
      amount: data.amount,
      notes: data.notes || ''
    });
  },
  getTransactions: () => api.get('/transactions'),
  getTransaction: (id) => api.get(`/transaction/${id}`),
  getCustomerTransactions: (customerId) => api.get(`/customer/${customerId}/transactions`),
  deleteTransaction: (id) => api.delete(`/transaction/${id}/delete`),
};

// Recurring Transaction APIs
export const recurringAPI = {
  getRecurringTransactions: () => api.get('/recurring-transactions'),
  createRecurringTransaction: (data) => api.post('/recurring-transaction/create', data),
  updateRecurringTransaction: (id, data) => api.put(`/recurring-transaction/${id}/update`, data),
  deleteRecurringTransaction: (id) => api.delete(`/recurring-transaction/${id}/delete`),
  toggleRecurringTransaction: (id) => api.post(`/recurring-transaction/${id}/toggle`),
};

// Products / Inventory APIs
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (productId) => api.get(`/product/${productId}`),
  addProduct: (data) => api.post('/product', data),
  updateProduct: (productId, data) => api.put(`/product/${productId}`, data),
  deleteProduct: (productId) => api.delete(`/product/${productId}`),
  getCategories: () => api.get('/products/categories'),
  getUnits: () => api.get('/products/units'),
};

// Reminder APIs
export const reminderAPI = {
  sendReminder: (customerId) => api.post(`/customer/${customerId}/remind`),
  getBulkReminders: () => api.get('/customers/remind-all'),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => {
    // If data contains a file, use FormData
    if (data.profile_photo) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.phone) formData.append('phone', data.phone);
      formData.append('profile_photo', data.profile_photo);
      
      return api.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put('/profile', data);
  },
};

// QR Code APIs
export const qrAPI = {
  getQRCode: () => api.get('/business/qr-code', { responseType: 'blob' }),
  getAccessPin: () => api.get('/business/access-pin'),
};

// Utility APIs
export const utilityAPI = {
  healthCheck: () => api.get('/health'),
  getPrivacyPolicy: () => api.get('/privacy'),
  getTerms: () => api.get('/terms'),
};

export default api;
