import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';

/**
 * Custom hook for booking management
 * Provides queries and mutations for all booking operations
 */

export const useBookings = () => {
  const queryClient = useQueryClient();

  // Fetch all bookings (Admin)
  const allBookings = useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: bookingService.getAllBookings,
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user's own bookings
  const myBookings = useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: bookingService.getMyBookings,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  // Fetch single booking by ID
  const getBooking = (id, enabled = true) =>
    useQuery({
      queryKey: ['bookings', id],
      queryFn: () => bookingService.getBookingById(id),
      enabled: !!id && enabled,
      staleTime: 2 * 60 * 1000,
    });

  // Create booking mutation
  const createMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return data;
    },
    onError: (error) => {
      console.error('Create booking error:', error);
    },
  });

  // Approve booking mutation (Admin)
  const approveMutation = useMutation({
    mutationFn: bookingService.approveBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return data;
    },
    onError: (error) => {
      console.error('Approve booking error:', error);
    },
  });

  // Reject booking mutation (Admin)
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingService.rejectBooking(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return data;
    },
    onError: (error) => {
      console.error('Reject booking error:', error);
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return data;
    },
    onError: (error) => {
      console.error('Cancel booking error:', error);
    },
  });

  return {
    // Queries
    allBookings,
    myBookings,
    getBooking,
    // Mutations
    createBooking: createMutation.mutateAsync,
    approveBooking: approveMutation.mutateAsync,
    rejectBooking: rejectMutation.mutateAsync,
    cancelBooking: cancelMutation.mutateAsync,
    // Loading states
    isCreating: createMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};
