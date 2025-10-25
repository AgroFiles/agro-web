import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Share2,
  Search,
  Shield,
  Cloud,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-field-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AgroFiles Logo" className="w-12 h-12 object-contain" />
              <h1 className="text-xl font-bold text-gray-900">AgroFiles</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/sign-in">
                <Button variant="outline" className="border-[rgb(var(--primary-500))] text-[rgb(var(--primary-600))] hover:bg-[rgb(var(--primary-50))] hover:border-[rgb(var(--primary-600))]">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center mb-6">
            <img src="/logo.png" alt="AgroFiles Logo" className="w-32 h-32 object-contain" />
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Tu Registro Histórico Agropecuario
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Gestiona, organiza y comparte tus archivos agropecuarios de forma moderna y eficiente.
            La solución digital para productores del campo argentino.
          </p>
          <div className="flex items-center justify-center realtiva z-0">
            <Link to="/sign-up">
              <Button className="gap-2 shadow-lg">
                Comenzar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas en un solo lugar
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Desarrollado específicamente para las necesidades del productor agropecuario moderno
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <CardTitle>Gestión de Archivos</CardTitle>
              <CardDescription>
                Organiza todos tus documentos, informes de cosecha, análisis de suelo y registros sanitarios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-field-100 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-field-600" />
              </div>
              <CardTitle>Compartir Fácilmente</CardTitle>
              <CardDescription>
                Comparte archivos y carpetas con tu equipo, asesores técnicos o instituciones de forma segura
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Búsqueda Avanzada</CardTitle>
              <CardDescription>
                Encuentra cualquier documento rápidamente con filtros por categoría, fecha y tipo de archivo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Seguro y Confiable</CardTitle>
              <CardDescription>
                Tus datos están protegidos con las mejores prácticas de seguridad y respaldos automáticos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Acceso desde Cualquier Lugar</CardTitle>
              <CardDescription>
                Accede a tus archivos desde el campo, la oficina o tu casa, en cualquier dispositivo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Historial Completo</CardTitle>
              <CardDescription>
                Mantén un registro histórico del desarrollo de tu actividad agropecuaria año tras año
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-br from-primary-500 to-field-500 border-0 text-white">
          <CardContent className="p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-4">
                Moderniza la gestión de tu establecimiento
              </h3>
              <p className="text-lg mb-8 text-primary-50">
                Únete a los productores que ya están digitalizando sus registros agropecuarios
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Sin costos ocultos</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Soporte técnico</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Actualizado constantemente</span>
                </div>
              </div>
              <Link to="/sign-up">
                <Button size="lg" variant="secondary" className="gap-2">
                  Crear Cuenta Gratis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="AgroFiles Logo" className="w-10 h-10 object-contain" />
              <span className="font-semibold text-gray-900">AgroFiles</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 AgroFiles. Desarrollado para el campo argentino.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
