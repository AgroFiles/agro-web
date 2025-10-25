import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sprout,
  Search as SearchIcon,
  FileText,
  Folder,
  LogOut,
  Home,
  Calendar,
  Filter
} from 'lucide-react'

// Mock de resultados de búsqueda
const mockSearchResults = [
  { id: '1', name: 'Informe Cosecha 2024', type: 'document', date: '2024-10-20', category: 'Cosecha', size: '2.4 MB' },
  { id: '2', name: 'Análisis de Suelo Parcela Norte', type: 'document', date: '2024-10-18', category: 'Análisis', size: '1.2 MB' },
  { id: '3', name: 'Registros Sanitarios 2024', type: 'folder', date: '2024-10-15', category: 'Sanidad', size: '-' },
  { id: '4', name: 'Plan de Fertilización Otoño', type: 'document', date: '2024-10-10', category: 'Fertilización', size: '890 KB' },
  { id: '5', name: 'Informe Rendimiento Trigo', type: 'document', date: '2024-09-28', category: 'Cosecha', size: '3.1 MB' },
  { id: '6', name: 'Mapeo de Parcelas 2024', type: 'document', date: '2024-09-15', category: 'Planificación', size: '4.5 MB' },
]

export function SearchPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/sign-in')
  }

  const filteredResults = mockSearchResults.filter(item => {
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    const matchesType = !typeFilter || item.type === typeFilter
    return matchesQuery && matchesCategory && matchesType
  })

  const categories = [...new Set(mockSearchResults.map(item => item.category))]

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
                <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Home className="w-4 h-4" />
                  Inicio
                </Link>
                <Link to="/search" className="flex items-center gap-2 text-primary-600 font-medium">
                  <SearchIcon className="w-4 h-4" />
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Buscar Archivos</h2>
          <p className="text-gray-600">Encuentra todos tus registros agropecuarios en un solo lugar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="document">Documentos</option>
                    <option value="folder">Carpetas</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setTypeFilter('')
                    setCategoryFilter('')
                    setSearchQuery('')
                  }}
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Resultados */}
          <main className="lg:col-span-3">
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre de archivo..."
                  className="pl-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Información de resultados */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredResults.length} {filteredResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
              {(searchQuery || categoryFilter || typeFilter) && (
                <p className="text-sm text-gray-600">
                  Filtros activos
                </p>
              )}
            </div>

            {/* Lista de resultados */}
            <div className="space-y-3">
              {filteredResults.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'folder' ? 'bg-field-100' : 'bg-primary-100'
                      }`}>
                        {item.type === 'folder' ? (
                          <Folder className="w-6 h-6 text-field-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                          <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                          {item.type === 'document' && (
                            <span>{item.size}</span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Abrir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredResults.length === 0 && (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center">
                      <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No se encontraron resultados
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Intenta con otros términos de búsqueda o ajusta los filtros
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('')
                          setTypeFilter('')
                          setCategoryFilter('')
                        }}
                      >
                        Limpiar búsqueda
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
