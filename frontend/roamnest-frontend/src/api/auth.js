import axiosClient from './axiosClient';

export const register = async (data) => {
    const response = await axiosClient.post('/api/auth/register/', data);
    return response.data;
};

export const login = async (email, password) => {
    const response = await axiosClient.post('/api/auth/login/', { email, password });
    return response.data;
};

export const logout = async () => {
    await axiosClient.post('/api/auth/logout/');
};

export const getMe = async () => {
    const response = await axiosClient.get('/api/auth/me/');
    return response.data;
};