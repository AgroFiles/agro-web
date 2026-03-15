import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User, SignupParams } from '@/types/user'
import { apiClient } from '@/lib/api-client'

interface AuthResponse {
  token: string
  user: User
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
          const { token, user } = response.data
          set({ token, user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async ({ email, password, razonSocial, cuit, tipo }: SignupParams) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post<AuthResponse>('/auth/register', {
            email,
            password,
            razonSocial,
            cuit: cuit || undefined,
            tipo,
          })
          const { token, user } = response.data
          set({ token, user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const state = useAuthStore.getState()
        if (!state.token || !state.user) {
          set({ isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
