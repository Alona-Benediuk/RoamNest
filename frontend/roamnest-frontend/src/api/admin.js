import axiosClient from './axiosClient';

export const getAdminUsers = async () => {
    const response = await axiosClient.get('/api/admin/users/');
    return response.data;
};

export const updateUserStatus = async (id, data) => {
    const response = await axiosClient.patch(`/api/admin/users/${id}/`, data);
    return response.data;
};

export const getAdminProperties = async () => {
    const response = await axiosClient.get('/api/admin/properties/');
    return response.data;
};

export const updateAdminPropertyStatus = async (id, status) => {
    const response = await axiosClient.patch(`/api/admin/properties/${id}/`, { status });
    return response.data;
};

export const deleteAdminProperty = async (id) => {
    const response = await axiosClient.delete(`/api/admin/properties/${id}/`);
    return response.data;
};