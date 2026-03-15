import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { NotificacionesBell } from '@/components/notificaciones-bell'
import {
  Home,
  FileText,
  MapPin,
  User,
  LogOut,
  Users,
  Network,
} from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
}

const producerNavItems = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/documentos', icon: FileText, label: 'Documentos' },
  { to: '/establecimientos', icon: MapPin, label: 'Establecimientos' },
  { to: '/red-colaboracion', icon: Network, label: 'Red Rural' },
  { to: '/perfil', icon: User, label: 'Mi Perfil' },
]

const prestadorNavItems = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/documentos', icon: FileText, label: 'Documentos' },
  { to: '/mis-clientes', icon: Users, label: 'Mis Clientes' },
  { to: '/perfil', icon: User, label: 'Mi Perfil' },
]

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navItems = user?.tipo === 'PRESTADOR_DE_SERVICIOS' ? prestadorNavItems : producerNavItems

  const handleLogout = () => {
    logout()
    navigate('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <img src="/logo.png" alt="AgroData" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold text-gray-900 hidden sm:block">AgroData</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1 ml-6">
                {navItems.map(({ to, icon: Icon, label }) => {
                  const active = location.pathname === to
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User + logout */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.razonSocial}</p>
                <p className="text-xs text-gray-500">
                  {user?.tipo === 'PRODUCTOR' ? 'Productor' : 'Prestador de Servicios'}
                </p>
              </div>
              {user?.tipo === 'PRODUCTOR' && <NotificacionesBell />}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
