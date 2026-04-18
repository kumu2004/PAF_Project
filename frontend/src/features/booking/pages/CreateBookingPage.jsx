import React from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CalendarDays, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BookingForm } from '../components/BookingForm';
import { useBookings } from '../hooks/useBookings';
import { useResources } from '../../resources/hooks/useResources';
import { useAuthStore } from '../../../store/authStore';

const ALLOWED_ROLES = ['STUDENT', 'LECTURER'];

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return fallback;
};

export const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resourceId = searchParams.get('resourceId') || '';

  const { user } = useAuthStore();
  const { createBooking, isCreating } = useBookings();
  const { data: resource, isLoading: isLoadingResource } = useResources(
    resourceId ? { id: resourceId, enabled: true } : { enabled: false }
  );
  const studentAllowedTypes = ['MEETING_ROOM', 'EQUIPMENT'];
  const isStudentBlockedByType =
    user?.role === 'STUDENT' && resource && !studentAllowedTypes.includes(resource.type);

  if (!ALLOWED_ROLES.includes(user?.role)) {
    return <Navigate to="/bookings/my" replace />;
  }

  if (isStudentBlockedByType) {
    return <Navigate to="/student/resources" replace />;
  }

  const handleCreateBooking = async (payload) => {
    try {
      await createBooking(payload);
      toast.success('Booking created and sent for approval.');
      navigate('/bookings/my');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Unable to create booking right now.');
      const normalized = (errorMessage || '').toLowerCase();
      if (normalized.includes('conflict') || normalized.includes('overlap') || normalized.includes('already booked')) {
        toast.error('Time conflict detected. This resource is already booked for the selected range.');
      } else {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 pb-12">
      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden"
        style={{ background: '#182c51' }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='none' stroke='%23f47920' stroke-width='1' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px',
          }}
        />

        <div className="relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border"
            style={{ background: 'rgba(244,121,32,0.1)', borderColor: 'rgba(244,121,32,0.3)', color: '#f47920' }}
          >
            <CalendarDays className="w-3 h-3" />
            Reservation Request
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Book{' '}
            <span style={{ color: '#f47920' }}>Resource</span>
          </h1>
          
          <p className="text-slate-400 text-base mt-3 max-w-lg">
            Complete the form below to submit your booking request. Requests are reviewed by administrators and tracked in your dashboard.
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Main Form Area */}
          <div className="lg:col-span-12">
            {resourceId && isLoadingResource ? (
              <div
                className="rounded-3xl border border-dashed p-12 flex flex-col items-center justify-center bg-white/50"
                style={{ borderColor: 'rgba(24,44,81,0.15)' }}
              >
                <Loader className="w-10 h-10 animate-spin mb-4" style={{ color: '#f47920' }} />
                <p className="text-slate-500 font-medium font-sans">Fetching resource details...</p>
              </div>
            ) : (
              <BookingForm
                onSubmit={handleCreateBooking}
                isLoading={isCreating}
                initialResourceId={resourceId}
                resourceLabel={resource?.name}
                maxAttendees={resource?.capacity}
                submitText="Submit Booking Request"
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

