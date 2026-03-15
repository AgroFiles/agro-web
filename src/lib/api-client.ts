import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// Interceptor para agregar JWT
apiClient.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    const { state } = JSON.parse(authStorage)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Interceptor para manejar 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/')
      if (!isAuthRoute) {
        localStorage.removeItem('auth-storage')
        window.location.href = '/sign-in'
      }
    }
    return Promise.reject(error)
  }
)
