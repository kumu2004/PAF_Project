import React, { useEffect, useState, useRef } from 'react';
import { format, addHours, parse, isValid, setHours, setMinutes } from 'date-fns';
import { 
  AlertCircle, 
  Building, 
  FileText, 
  Clock, 
  Users, 
  Send,
  Calendar,
  ChevronDown,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Custom 30-Minute Interval DateTime Picker
 */
const SmartDateTimePicker = ({ value, onChange, label, error, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Parse current value
  const dateValue = value ? new Date(value) : new Date();
  const dateStr = isValid(dateValue) ? format(dateValue, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const selectedHour = isValid(dateValue) ? dateValue.getHours() : 0;
  const selectedMinute = isValid(dateValue) ? (dateValue.getMinutes() >= 30 ? 30 : 0) : 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (e) => {
    const newDateStr = e.target.value;
    const baseDate = parse(newDateStr, 'yyyy-MM-dd', new Date());
    const finalDate = setMinutes(setHours(baseDate, selectedHour), selectedMinute);
    onChange(format(finalDate, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTimeSelect = (h, m) => {
    const baseDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    const finalDate = setMinutes(setHours(baseDate, h), m);
    onChange(format(finalDate, "yyyy-MM-dd'T'HH:mm"));
    // Don't close immediately to allow tweaking
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 30];

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="block text-sm font-bold text-[#182c51] ml-1">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full h-14 pl-11 pr-4 rounded-xl border transition-all duration-200 cursor-pointer
          ${isOpen ? 'border-orange-400 ring-4 ring-orange-100/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <div className="absolute left-3.5 flex items-center gap-2">
          {Icon && <Icon className={`w-4.5 h-4.5 ${error ? 'text-red-400' : 'text-slate-400'}`} />}
        </div>
        
        <span className="text-slate-700 font-medium">
          {isValid(dateValue) ? format(dateValue, 'dd/MM/yyyy HH:mm') : 'Select Date & Time'}
        </span>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 overflow-hidden"
          >
            <div className="space-y-4">
              {/* Date Input */}
              <div className="relative">
                <input
                  type="date"
                  value={dateStr}
                  onChange={handleDateChange}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-400 font-medium text-slate-700"
                />
              </div>

              {/* Time Roller */}
              <div className="flex gap-2 h-48">
                {/* Hours */}
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 sticky top-0 bg-white py-1">Hour</p>
                  <div className="space-y-1">
                    {hours.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleTimeSelect(h, selectedMinute)}
                        className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                          selectedHour === h ? 'bg-orange-500 text-[#182c51]' : 'hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        {h.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes */}
                <div className="w-20 overflow-y-auto pr-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 sticky top-0 bg-white py-1">Min</p>
                  <div className="space-y-1">
                    {minutes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleTimeSelect(selectedHour, m)}
                        className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${
                          selectedMinute === m ? 'bg-orange-500 text-[#182c51]' : 'hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        {m.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-[#182c51] text-white rounded-xl text-xs font-bold hover:bg-[#1f3a6a] transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
};

/**
 * BookingForm Component
 */
export const BookingForm = ({
  onSubmit,
  isLoading,
  conflictWarning,
  initialResourceId = '',
  resourceLabel,
  maxAttendees,
  submitText = 'Create Booking',
}) => {
  // Ensure initial time is snapped to 30min intervals
  const snapTo30 = (date) => {
    const m = date.getMinutes();
    const newM = m >= 30 ? 30 : 0;
    return setMinutes(date, newM);
  };

  const [formData, setFormData] = useState({
    resourceId: initialResourceId,
    startTime: format(snapTo30(new Date()), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(addHours(snapTo30(new Date()), 1), "yyyy-MM-dd'T'HH:mm"),
    purpose: '',
    expectedAttendees: 1,
  });

  const [errors, setErrors] = useState({});
  const isPreselectedResource = Boolean(initialResourceId);
  const resourceDisplayValue = isPreselectedResource
    ? (resourceLabel || 'Loading resource...')
    : formData.resourceId;

  useEffect(() => {
    if (!initialResourceId) return;
    setFormData((prev) => ({
      ...prev,
      resourceId: initialResourceId,
    }));
  }, [initialResourceId]);

  const validateForm = () => {
    const newErrors = {};
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);

    if (!formData.resourceId.trim()) {
      newErrors.resourceId = 'Resource is required';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    if (!formData.expectedAttendees || formData.expectedAttendees < 1) {
      newErrors.expectedAttendees = 'At least 1 attendee is required';
    }
    if (maxAttendees && Number(formData.expectedAttendees) > maxAttendees) {
      newErrors.expectedAttendees = `Attendees cannot exceed resource capacity (${maxAttendees})`;
    }
    if (end <= start) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (start < new Date()) {
      newErrors.startTime = 'Start time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCustomDateTimeChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEndTimeAdjust = () => {
    const start = new Date(formData.startTime);
    const newEnd = addHours(start, 1);
    setFormData((prev) => ({
      ...prev,
      endTime: format(newEnd, "yyyy-MM-dd'T'HH:mm"),
    }));
  };

  const inputClasses = (error) => `
    w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200
    focus:outline-none focus:ring-2
    ${error 
      ? 'border-red-300 bg-red-50 focus:ring-red-200 text-red-900 placeholder-red-300' 
      : 'border-slate-200 bg-slate-50/50 focus:border-orange-400 focus:ring-orange-100/50 text-slate-800 placeholder-slate-400'}
  `;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 border border-slate-100 max-w-2xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#182c51]">Submit Request</h2>
            <p className="text-sm text-slate-400 font-medium">Please fill in all details accurately</p>
          </div>
        </div>

        {conflictWarning && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">{conflictWarning}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="resourceId" className="block text-sm font-bold text-[#182c51] ml-1">
              Resource
            </label>
            <div className="relative">
              <Building className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.resourceId ? 'text-red-400' : 'text-slate-400'}`} />
              <input
                type="text"
                id="resourceId"
                name="resourceId"
                value={resourceDisplayValue}
                onChange={handleChange}
                placeholder="e.g., Meeting Room 101"
                readOnly={isPreselectedResource}
                className={`${inputClasses(errors.resourceId)} ${isPreselectedResource ? 'bg-slate-100 border-dashed cursor-not-allowed opacity-80' : ''}`}
              />
            </div>
            {isPreselectedResource && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 ml-1">
                Resource ID: <span className="text-orange-600">{formData.resourceId}</span>
              </p>
            )}
            {errors.resourceId && (
              <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{errors.resourceId}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="purpose" className="block text-sm font-bold text-[#182c51] ml-1">
              Purpose
            </label>
            <div className="relative">
              <FileText className={`absolute left-3.5 top-4 w-4.5 h-4.5 ${errors.purpose ? 'text-red-400' : 'text-slate-400'}`} />
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="What is this booking for?"
                rows={3}
                className={`${inputClasses(errors.purpose)} resize-none`}
              />
            </div>
            {errors.purpose && (
              <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{errors.purpose}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <SmartDateTimePicker
              label="Start Date & Time"
              icon={Clock}
              value={formData.startTime}
              onChange={(val) => handleCustomDateTimeChange('startTime', val)}
              error={errors.startTime}
            />

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <SmartDateTimePicker
                  label="End Date & Time"
                  icon={Clock}
                  value={formData.endTime}
                  onChange={(val) => handleCustomDateTimeChange('endTime', val)}
                  error={errors.endTime}
                />
              </div>
              <button
                type="button"
                onClick={handleEndTimeAdjust}
                className="mb-0 h-14 px-3 rounded-xl bg-orange-100 text-orange-600 text-xs font-black transition-all hover:bg-orange-200 active:scale-95 border border-orange-200"
              >
                +1h
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="expectedAttendees" className="block text-sm font-bold text-[#182c51] ml-1">
              Expected Attendees
            </label>
            <div className="relative">
              <Users className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.expectedAttendees ? 'text-red-400' : 'text-slate-400'}`} />
              <input
                type="number"
                id="expectedAttendees"
                name="expectedAttendees"
                value={formData.expectedAttendees}
                onChange={handleChange}
                min="1"
                max={maxAttendees || undefined}
                placeholder="e.g., 5"
                className={inputClasses(errors.expectedAttendees)}
              />
            </div>
            {errors.expectedAttendees && (
              <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{errors.expectedAttendees}</p>
            )}
            {maxAttendees && !errors.expectedAttendees && (
              <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Maximum capacity: <span className="text-[#182c51]">{maxAttendees}</span>
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-[#182c51] font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200/50 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {submitText}
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-[0.2em]">
              Smart Campus Operation Hub • Reservation System
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};


