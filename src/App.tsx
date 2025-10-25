import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { SignInPage } from '@/pages/sign-in'
import { SignUpPage } from '@/pages/sign-up'
import { DashboardPage } from '@/pages/dashboard'
import { SearchPage } from '@/pages/search'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuthStore } from '@/store/auth-store'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz - Landing page pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas públicas - redirigen al dashboard si ya está autenticado */}
        <Route
          path="/sign-in"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignInPage />
          }
        />
        <Route
          path="/sign-up"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignUpPage />
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
