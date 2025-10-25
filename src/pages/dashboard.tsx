import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Sprout,
  Search,
  FileText,
  Folder,
  Upload,
  Share2,
  Trash2,
  Plus,
  LogOut,
  Home,
  Clock,
  Star
} from 'lucide-react'

// Mock de archivos
const mockFiles = [
  { id: '1', name: 'Informe Cosecha 2024', type: 'document', date: '2024-10-20', shared: false },
  { id: '2', name: 'Análisis de Suelo', type: 'document', date: '2024-10-18', shared: true },
  { id: '3', name: 'Registros Sanitarios', type: 'folder', date: '2024-10-15', shared: false },
  { id: '4', name: 'Plan de Fertilización', type: 'document', date: '2024-10-10', shared: false },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/sign-in')
  }

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="AgroFiles Logo" className="w-12 h-12 object-contain" />
                <h1 className="text-xl font-bold text-gray-900">AgroFiles</h1>
              </div>

              {/* Navegación */}
              <nav className="hidden md:flex items-center gap-6 ml-8">
                <Link to="/dashboard" className="flex items-center gap-2 text-primary-600 font-medium">
                  <Home className="w-4 h-4" />
                  Inicio
                </Link>
                <Link to="/search" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Search className="w-4 h-4" />
                  Buscar
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Hola, <span className="font-medium">{user?.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Archivo
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Folder className="w-4 h-4 mr-2" />
                  Nueva Carpeta
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Archivo
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Almacenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usado</span>
                    <span className="font-medium">2.4 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[rgb(var(--primary-500))] h-2 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Contenido Principal */}
          <main className="lg:col-span-3">
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar archivos y carpetas..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-gray-600">Archivos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-field-100 rounded-lg flex items-center justify-center">
                      <Folder className="w-6 h-6 text-field-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">8</p>
                      <p className="text-sm text-gray-600">Carpetas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-sm text-gray-600">Compartidos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Archivos */}
            <Card>
              <CardHeader>
                <CardTitle>Archivos Recientes</CardTitle>
                <CardDescription>
                  Tus archivos y carpetas más recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          file.type === 'folder' ? 'bg-field-100' : 'bg-primary-100'
                        }`}>
                          {file.type === 'folder' ? (
                            <Folder className={`w-5 h-5 ${file.type === 'folder' ? 'text-field-600' : 'text-primary-600'}`} />
                          ) : (
                            <FileText className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {file.date}
                            {file.shared && (
                              <span className="inline-flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                Compartido
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFiles.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No se encontraron archivos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
