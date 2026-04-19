import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * RejectModal Component
 * Modal for entering rejection reason when rejecting a booking
 */
export const RejectModal = ({ isOpen, bookingId, onReject, onCancel, isLoading }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    onReject(bookingId, reason);
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reject Booking</h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Please provide a reason for rejecting this booking..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};
