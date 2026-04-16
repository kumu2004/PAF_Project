import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Combined authentication setter
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      
      setToken: (token) => set({ token }),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      
      // Update specific user fields
      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
      
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
