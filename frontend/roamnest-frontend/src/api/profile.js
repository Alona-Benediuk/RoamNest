import axiosClient from './axiosClient';

export const getProfile = async (userId) => {
    const response = await axiosClient.get('/profile/', { params: { user_id: userId } });
    return response.data;
};

export const updateProfile = async (userId, data) => {
    const response = await axiosClient.patch('/profile/', data, { params: { user_id: userId } });
    return response.data;
};