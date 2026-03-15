export interface User {
  id: number
  email: string
  razonSocial: string
  tipo: string   // 'PRODUCTOR' | 'PRESTADOR_DE_SERVICIOS'
  estado: string // 'ACTIVO' | 'INACTIVO' | 'PENDIENTE'
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (params: SignupParams) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export interface SignupParams {
  email: string
  password: string
  razonSocial: string
  cuit?: string
  tipo: string
}
