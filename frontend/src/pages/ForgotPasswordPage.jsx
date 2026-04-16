import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { LandingNavbar } from './landing/components/LandingNavbar';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // email | otp | password | done

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const canSubmitEmail = useMemo(() => isValidEmail(email), [email]);
  const canSubmitOtp = useMemo(() => otp.trim().length === 6, [otp]);
  const canSubmitPassword = useMemo(() => newPassword.length >= 8 && newPassword === confirmPassword, [newPassword, confirmPassword]);

  const requestOtp = async () => {
    setError('');
    setInfo('');
    if (!canSubmitEmail) {
      setError('Please enter a valid email.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/password-reset/request-otp', { email: email.trim() });
      setInfo(res.data?.message || 'OTP sent to email.');
      setStep('otp');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setInfo('');
    if (!canSubmitOtp) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/password-reset/verify-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });
      setInfo(res.data?.message || 'OTP verified.');
      setStep('password');
    } catch (e) {
      setError(e.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError('');
    setInfo('');
    if (!canSubmitPassword) {
      if (newPassword.length < 8) setError('Password must be at least 8 characters.');
      else setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/password-reset/reset', {
        email: email.trim(),
        newPassword,
        confirmPassword,
      });
      setInfo(res.data?.message || 'Password reset successful.');
      setStep('done');
    } catch (e) {
      setError(e.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const showPasswordStep = step === 'password' || step === 'done';

  return (
    <>
      <LandingNavbar mode="landing" />
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#001529] px-4 pt-24 pb-6 overflow-hidden font-sans">
        <div className="relative w-full max-w-6xl h-[85vh] min-h-[620px] max-h-[760px] bg-white overflow-hidden rounded-3xl shadow-2xl">
          {/* Left panel: Email + OTP (slides out on password step on lg) */}
          <div
            className={`absolute top-0 left-0 h-full w-full lg:w-1/2 z-20 flex flex-col items-center justify-center px-8 bg-white
                        transition-all duration-700 ease-in-out
                        ${showPasswordStep ? 'lg:-translate-x-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-x-0 lg:opacity-100'}`}
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="w-full text-center mb-4">
                <h1 className="text-3xl font-black text-slate-900 mb-1">Forget Password</h1>
                <p className="text-slate-400 text-sm font-medium">
                  Reset your password using a 6-digit OTP
                </p>
              </div>

            {error && (
              <div className="w-full bg-red-100 text-red-600 p-3 rounded-lg text-xs font-semibold text-center mb-4">
                {error}
              </div>
            )}
            {info && (
              <div className="w-full bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-semibold text-center mb-4">
                {info}
              </div>
            )}

              <div className="w-full space-y-4">
                {/* Step 1: Email */}
                <div className={`transition-opacity ${step === 'email' ? 'opacity-100' : 'opacity-60'}`}>
                <input value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())}type="email"placeholder="Email Address*" className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f47920] focus:bg-white transition-all shadow-sm shadow-[#f47920]/10" disabled={loading || step !== 'email'}/>
                  {step === 'email' && (
                    <button
                      onClick={requestOtp}
                      disabled={loading}
                      className="w-full py-4 bg-[#f47920] text-white font-bold rounded-full uppercase text-sm tracking-widest hover:bg-[#e56c16] hover:shadow-lg hover:shadow-[#f47920]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-3"
                    >
                      {loading ? 'WAIT...' : 'Add email'}
                    </button>
                  )}
                </div>

                {/* Step 2: OTP */}
                {step !== 'email' && (
                  <div className={`transition-opacity ${step === 'otp' ? 'opacity-100' : 'opacity-60'}`}>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit OTP"
                      className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f47920] focus:bg-white transition-all shadow-sm shadow-[#f47920]/10 tracking-[0.35em]"
                      disabled={loading || step !== 'otp'}
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={requestOtp}
                        disabled={loading || step !== 'otp'}
                        className="flex-1 py-4 bg-white border-2 border-[#f47920] text-[#f47920] font-bold rounded-full uppercase text-sm tracking-widest hover:bg-[#f47920]/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        Resend
                      </button>
                      <button
                        onClick={verifyOtp}
                        disabled={loading || step !== 'otp'}
                        className="flex-1 py-4 bg-[#f47920] text-white font-bold rounded-full uppercase text-sm tracking-widest hover:bg-[#e56c16] hover:shadow-lg hover:shadow-[#f47920]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading && step === 'otp' ? 'WAIT...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile-only: New password fields */}
                <div className="lg:hidden">
                  {step === 'password' && (
                    <div className="transition-opacity opacity-100">
                      <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password"
                        placeholder="New Password*"
                        className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f47920] focus:bg-white transition-all shadow-sm shadow-[#f47920]/10"
                        disabled={loading}
                      />
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="Confirm Password*"
                        className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f47920] focus:bg-white transition-all shadow-sm shadow-[#f47920]/10 mt-3"
                        disabled={loading}
                      />
                      <button
                        onClick={resetPassword}
                        disabled={loading}
                        className="w-full py-4 bg-[#182c51] text-white font-bold rounded-full uppercase text-sm tracking-widest hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-3"
                      >
                        {loading ? 'WAIT...' : 'Set new password'}
                      </button>
                    </div>
                  )}

                  {step === 'done' && (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-4 bg-[#182c51] text-white font-bold rounded-full uppercase text-sm tracking-widest hover:opacity-95 transition-all active:scale-[0.98]"
                    >
                      Go to login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right overlay panel (before OTP verify) */}
          <div
            className={`hidden lg:block absolute top-0 right-0 h-full w-1/2 overflow-hidden z-10
                        transition-all duration-700 ease-in-out
                        ${showPasswordStep ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}
            style={{
              backgroundImage:
                "linear-gradient(rgba(244, 121, 32, 0.88), rgba(229, 108, 22, 0.88)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Reset your password</h2>
              <p className="text-lg font-light mb-8 max-w-sm leading-relaxed">
                Enter your email to receive a 6-digit OTP. Verify it to set a new password.
              </p>
            </div>
          </div>

          {/* Left overlay panel (after OTP verify) */}
          <div
            className={`hidden lg:block absolute top-0 left-0 h-full w-1/2 overflow-hidden z-10
                        transition-all duration-700 ease-in-out
                        ${showPasswordStep ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
            style={{
              backgroundImage:
                "linear-gradient(rgba(244, 121, 32, 0.88), rgba(229, 108, 22, 0.88)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Almost done</h2>
              <p className="text-lg font-light mb-8 max-w-sm leading-relaxed">
                Create a strong new password and confirm it to finish resetting your account.
              </p>
            </div>
          </div>

          {/* Right panel: Password form (slides in after OTP verify on lg) */}
          <div
            className={`hidden lg:flex absolute top-0 right-0 h-full w-1/2 z-30 flex-col items-center justify-center px-8 bg-white
                        transition-all duration-700 ease-in-out
                        ${showPasswordStep ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="w-full text-center mb-4">
                <h2 className="text-3xl font-black text-slate-900 mb-1">Create New Password</h2>
                <p className="text-slate-400 text-sm font-medium">
                  OTP verified — set a new password for {email || 'your account'}
                </p>
              </div>

              {error && (
                <div className="w-full bg-red-100 text-red-600 p-3 rounded-lg text-xs font-semibold text-center mb-4">
                  {error}
                </div>
              )}
              {info && (
                <div className="w-full bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-semibold text-center mb-4">
                  {info}
                </div>
              )}

              {step === 'password' && (
                <div className="w-full">
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    placeholder="New Password*"
                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f47920] focus:bg-white transition-all shadow-sm shadow-[#f47920]/10"
                    disabled={loading}
                  />
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Confirm Password*"
                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#f47920] focus:bg-white transition-all shadow-sm shadow-[#f47920]/10 mt-3"
                    disabled={loading}
                  />
                  <button
                    onClick={resetPassword}
                    disabled={loading}
                    className="w-full py-4 bg-[#f47920] text-white font-bold rounded-full uppercase text-sm tracking-widest hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-3"
                  >
                    {loading ? 'WAIT...' : 'Set new password'}
                  </button>
                </div>
              )}

              {step === 'done' && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-[#182c51] text-white font-bold rounded-full uppercase text-sm tracking-widest hover:opacity-95 transition-all active:scale-[0.98]"
                >
                  Go to login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

