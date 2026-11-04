import axiosClient from './axiosClient';

export const getOwnerProperties = async (ownerId) => {
    const response = await axiosClient.get('/api/owner/properties/', { params: { owner_id: ownerId } });
    return response.data;
};

export const getOwnerBookings = async (ownerId) => {
    const response = await axiosClient.get('/api/owner/bookings/', { params: { owner_id: ownerId } });
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await axiosClient.patch(`/api/owner/bookings/${id}/`, { status });
    return response.data;
};