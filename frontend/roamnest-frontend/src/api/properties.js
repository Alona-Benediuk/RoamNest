import axiosClient from './axiosClient';

export const getProperties = async (params = {}) => {
    const response = await axiosClient.get('/api/properties/', { params });
    return response.data;
};

export const getPropertyById = async (id) => {
    const response = await axiosClient.get(`/api/properties/${id}/`);
    return response.data;
};

export const getAmenities = async () => {
    const response = await axiosClient.get('/api/amenities/');
    return response.data;
};

export const createProperty = async (data) => {
    const response = await axiosClient.post('/properties/', data);
    return response.data;
};

export const updateProperty = async (id, data) => {
    const response = await axiosClient.patch(`/properties/${id}/`, data);
    return response.data;
};