import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * After Google OAuth, Spring Boot redirects here with ?token=<jwt>
 * We save the token to Zustand and navigate to /dashboard.
 */
export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        // Save token first so the request can use it
        setToken(token);
        
        // Fetch full profile info
        const res = await axios.get('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = res.data.data;
        setUser({
          userId: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          profilePictureUrl: userData.profilePictureUrl,
        });
        
        navigate('/dashboard');
      } catch (err) {
        console.error('Error fetching OAuth profile:', err);
        navigate('/login?error=oauth_failed');
      }
    };

    fetchProfile();
  }, [navigate, searchParams, setToken, setUser]);

  return (
    <div className="flex justify-center items-center min-h-screen font-sans bg-gradient-to-br from-slate-900 to-slate-800 text-white text-lg">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="font-medium tracking-wide">Signing you in…</p>
      </div>
    </div>
  );
}
