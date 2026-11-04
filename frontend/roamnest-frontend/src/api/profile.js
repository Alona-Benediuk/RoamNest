import axiosClient from './axiosClient';

export const getProfile = async () => {
    const response = await axiosClient.get('/api/profile/');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await axiosClient.patch('/api/profile/', data);
    return response.data;
};