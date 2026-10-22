import axiosClient from './axiosClient';

export const getAdminUsers = async () => {
    const response = await axiosClient.get('/admin/users/');
    return response.data;
};

export const updateUserStatus = async (id, data) => {
    const response = await axiosClient.patch(`/admin/users/${id}/`, data);
    return response.data;
};

export const getAdminProperties = async () => {
    const response = await axiosClient.get('/admin/properties/');
    return response.data;
};

export const updateAdminProperty = async (id, data) => {
    const response = await axiosClient.patch(`/admin/properties/${id}/`, data);
    return response.data;
};

export const deleteAdminProperty = async (id) => {
    const response = await axiosClient.delete(`/admin/properties/${id}/`);
    return response.data;
};