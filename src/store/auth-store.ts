import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '@/types/user'

// Mock de autenticación - reemplazar con llamadas reales al backend
const mockLogin = async (email: string, _password: string): Promise<User> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock: cualquier email/password funciona
  return {
    id: Math.random().toString(36).substring(7),
    email,
    name: email.split('@')[0],
    createdAt: new Date().toISOString(),
  }
}

const mockSignup = async (email: string, _password: string, name: string): Promise<User> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    id: Math.random().toString(36).substring(7),
    email,
    name,
    createdAt: new Date().toISOString(),
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await mockLogin(email, password)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        try {
          const user = await mockSignup(email, password, name)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: () => {
        // Esta función se puede usar para verificar el token en el futuro
        const state = useAuthStore.getState()
        if (!state.user) {
          set({ isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
