import axiosClient from './axiosClient';

export const getOwnerProperties = async (ownerId) => {
    const response = await axiosClient.get('/owner/properties/', { params: { owner_id: ownerId } });
    return response.data;
};

export const getOwnerBookings = async (ownerId) => {
    const response = await axiosClient.get('/owner/bookings/', { params: { owner_id: ownerId } });
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await axiosClient.patch(`/owner/bookings/${id}/`, { status });
    return response.data;
};