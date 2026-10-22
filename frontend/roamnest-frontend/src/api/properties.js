import axiosClient from './axiosClient';

export const getProperties = async (params = {}) => {
    const response = await axiosClient.get('/properties/', { params });
    return response.data;
};

export const getPropertyById = async (id) => {
    const response = await axiosClient.get(`/properties/${id}/`);
    return response.data;
};

export const getAmenities = async () => {
    const response = await axiosClient.get('/amenities/');
    return response.data;
};