import axiosClient from './axiosClient';

export const createBooking = async (data) => {
    const response = await axiosClient.post('/api/bookings/', data);
    return response.data;
};

export const getMyBookings = async (userId) => {
    const response = await axiosClient.get('/api/bookings/', { params: { user_id: userId } });
    return response.data;
};

export const cancelBooking = async (id) => {
    const response = await axiosClient.post(`/api/bookings/${id}/cancel/`);
    return response.data;
};