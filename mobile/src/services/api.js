/**
 * API Service - Handles all API calls to the Business backend
 * React Native version with AsyncStorage
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use local backend for development
const API_BASE_URL = 'http://192.168.1.95:5003/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
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
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            try {
                await AsyncStorage.multiRemove(['token', 'user']);
            } catch (e) {
                console.error('Error clearing storage:', e);
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
};

// Dashboard APIs
export const dashboardAPI = {
    getDashboard: () => api.get('/dashboard'),
};

// Customer APIs
export const customerAPI = {
    getCustomers: () => api.get('/customers'),
    getCustomer: (id) => api.get(`/customer/${id}`),
    addCustomer: (data) => api.post('/customer', data),
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

            // Append image file
            const uriParts = data.bill_photo.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('bill_photo', {
                uri: data.bill_photo.uri,
                name: `receipt.${fileType}`,
                type: `image/${fileType}`,
            });

            return api.post('/transaction', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }

        // When no file, send JSON
        return api.post('/transaction', {
            customer_id: data.customer_id,
            type: data.transaction_type,
            amount: data.amount,
            notes: data.notes || '',
        });
    },
    getTransactions: () => api.get('/transactions'),
    getTransaction: (id) => api.get(`/transaction/${id}`),
    getCustomerTransactions: (customerId) => api.get(`/customer/${customerId}/transactions`),
    deleteTransaction: (id) => api.delete(`/transaction/${id}/delete`),
};

// Products APIs
export const productsAPI = {
    getProducts: (params) => api.get('/products', { params }),
    getProduct: (productId) => api.get(`/product/${productId}`),
    addProduct: (data) => {
        if (data.product_image) {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'product_image' && data[key]?.uri) {
                    const uriParts = data[key].uri.split('.');
                    const fileType = uriParts[uriParts.length - 1];
                    formData.append(key, {
                        uri: data[key].uri,
                        name: `product.${fileType}`,
                        type: `image/${fileType}`,
                    });
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            return api.post('/product', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.post('/product', data);
    },
    updateProduct: (productId, data) => {
        if (data.product_image) {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'product_image' && data[key]?.uri) {
                    const uriParts = data[key].uri.split('.');
                    const fileType = uriParts[uriParts.length - 1];
                    formData.append(key, {
                        uri: data[key].uri,
                        name: `product.${fileType}`,
                        type: `image/${fileType}`,
                    });
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            return api.put(`/product/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.put(`/product/${productId}`, data);
    },
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
        if (data.profile_photo) {
            const formData = new FormData();
            if (data.name) formData.append('name', data.name);
            if (data.phone_number) formData.append('phone_number', data.phone_number);

            const uriParts = data.profile_photo.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('profile_photo', {
                uri: data.profile_photo.uri,
                name: `profile.${fileType}`,
                type: `image/${fileType}`,
            });

            return api.put('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.put('/profile', data);
    },
};

// QR Code APIs
export const qrAPI = {
    getAccessPin: () => api.get('/business/access-pin'),
};

export default api;
