/**
 * Auth Context - Authentication state management
 * React Native version with AsyncStorage
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load stored auth data on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const [token, userJson] = await AsyncStorage.multiGet(['token', 'user']);

            if (token[1] && userJson[1]) {
                setUser(JSON.parse(userJson[1]));
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (phone_number, password) => {
        try {
            const response = await authAPI.login({ phone_number, password });
            const { token, user: userData } = response.data;

            // Store auth data
            await AsyncStorage.multiSet([
                ['token', token],
                ['user', JSON.stringify(userData)],
            ]);

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed. Please try again.',
            };
        }
    };

    const register = async (business_name, phone_number, password) => {
        try {
            const response = await authAPI.register({
                business_name,
                phone_number,
                password,
            });

            const { token, user: userData } = response.data;

            // Store auth data
            await AsyncStorage.multiSet([
                ['token', token],
                ['user', JSON.stringify(userData)],
            ]);

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed. Please try again.',
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with logout even if API call fails
        }

        // Clear storage and state
        try {
            await AsyncStorage.multiRemove(['token', 'user']);
        } catch (error) {
            console.error('Error clearing storage:', error);
        }

        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
