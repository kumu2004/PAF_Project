import apiClient from '../../../services/apiClient';

const BOOKING_API = '/api/bookings';

/**
 * Booking Service - API integration for booking management
 * Handles all HTTP requests for booking operations
 */

export const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post(BOOKING_API, bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (id) => {
    try {
      const response = await apiClient.get(`${BOOKING_API}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get current user's bookings
   */
  getMyBookings: async () => {
    try {
      const response = await apiClient.get(`${BOOKING_API}/my`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all bookings (Admin only)
   */
  getAllBookings: async () => {
    try {
      const response = await apiClient.get(BOOKING_API);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (id) => {
    try {
      const response = await apiClient.patch(`${BOOKING_API}/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Approve a booking (Admin only)
   */
  approveBooking: async (id) => {
    try {
      const response = await apiClient.patch(`${BOOKING_API}/${id}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reject a booking (Admin only)
   */
  rejectBooking: async (id, reason) => {
    try {
      const response = await apiClient.patch(`${BOOKING_API}/${id}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
