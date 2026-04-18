import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Checks the JWT expiry on every mount and every 60 seconds.
 * If the token is expired, logs the user out and redirects to login.
 *
 * Why: JWT tokens have an expiry (exp) claim encoded in the payload.
 * We read it directly from the token — no API call needed.
 */
export function useSessionTimeout() {
  const { token, logout } = useAuthStore();
  const navigate           = useNavigate();

  useEffect(() => {
    if (!token) return;

    const checkExpiry = () => {
      try {
        const rawToken = typeof token === 'string' && token.startsWith('Bearer ')
          ? token.slice('Bearer '.length)
          : token;
        if (!rawToken || typeof rawToken !== 'string') throw new Error('Missing token');

        // Decode the JWT payload (base64 middle segment)
        let payloadPart = rawToken.split('.')[1];
        if (!payloadPart) throw new Error('Malformed token');

        // Fix base64url characters and add padding for strict browser atob
        payloadPart = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        while (payloadPart.length % 4) {
          payloadPart += '=';
        }

        const payload    = JSON.parse(atob(payloadPart));
        const expiryMs   = payload.exp * 1000;   // exp is in seconds
        const nowMs      = Date.now();

        if (nowMs >= expiryMs) {
          logout();
          navigate('/login', {
            state: {
              message: 'Your session has expired. Please sign in again.',
            },
          });
        }
      } catch {
        // Malformed token — log out
        logout();
        navigate('/login');
      }
    };

    // Check immediately and then every 60 seconds
    checkExpiry();
    const interval = setInterval(checkExpiry, 60_000);
    return () => clearInterval(interval);

  }, [token, logout, navigate]);
}