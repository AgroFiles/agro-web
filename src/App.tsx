import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { SignInPage } from '@/pages/sign-in'
import { SignUpPage } from '@/pages/sign-up'
import { DashboardPage } from '@/pages/dashboard'
import { DocumentosPage } from '@/pages/documentos'
import { EstablecimientosPage } from '@/pages/establecimientos'
import { PerfilPage } from '@/pages/perfil'
import { MisClientesPage } from '@/pages/mis-clientes'
import { RedColaboracionPage } from '@/pages/red-colaboracion'
import { DocPublicoPage } from '@/pages/doc-publico'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuthStore } from '@/store/auth-store'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/sign-in"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignInPage />}
        />
        <Route
          path="/sign-up"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
        />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/documentos" element={<ProtectedRoute><DocumentosPage /></ProtectedRoute>} />
        <Route path="/establecimientos" element={<ProtectedRoute><EstablecimientosPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/mis-clientes" element={<ProtectedRoute><MisClientesPage /></ProtectedRoute>} />
        <Route path="/red-colaboracion" element={<ProtectedRoute><RedColaboracionPage /></ProtectedRoute>} />

        {/* Public document link — no auth required */}
        <Route path="/doc/:token" element={<DocPublicoPage />} />

        {/* Legacy redirect */}
        <Route path="/search" element={<Navigate to="/documentos" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
