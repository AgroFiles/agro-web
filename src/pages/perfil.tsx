import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useRubros, useMisRubros, useAsignarRubro, useRemoverRubro } from '@/hooks/use-rubros'
import { User, Tag, Loader2, Plus, X } from 'lucide-react'

const TIPO_LABELS: Record<string, string> = {
  PRODUCTOR: 'Productor Agropecuario',
  PRESTADOR_DE_SERVICIOS: 'Prestador de Servicios',
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVO:    { label: 'Activo',    color: 'bg-green-100 text-green-700' },
  INACTIVO:  { label: 'Inactivo',  color: 'bg-gray-100 text-gray-600'   },
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
}

export function PerfilPage() {
  const { user } = useAuthStore()

  const isPrestador = user?.tipo === 'PRESTADOR_DE_SERVICIOS'

  const { data: catalogo = [], isLoading: loadingCatalogo } = useRubros()
  const { data: misRubros = [], isLoading: loadingMisRubros } = useMisRubros(user?.id ?? 0)
  const asignarMutation = useAsignarRubro(user?.id ?? 0)
  const removerMutation = useRemoverRubro(user?.id ?? 0)

  const rubrosDisponibles = catalogo.filter((r) => !misRubros.includes(r.nombre))

  const estadoInfo = user?.estado ? ESTADO_LABELS[user.estado] : null

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        <p className="text-gray-500 text-sm mt-1">Información de tu cuenta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Datos de la cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Razón Social</p>
              <p className="text-sm font-medium text-gray-900">{user?.razonSocial}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tipo de usuario</p>
              <p className="text-sm font-medium text-gray-900">
                {TIPO_LABELS[user?.tipo ?? ''] ?? user?.tipo}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Estado</p>
              {estadoInfo ? (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoInfo.color}`}>
                  {estadoInfo.label}
                </span>
              ) : (
                <p className="text-sm text-gray-900">{user?.estado}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rubros — only for prestadores */}
        {isPrestador && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4" />
                Mis Rubros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">
                Los rubros determinan a qué documentos podés acceder en la Red de Colaboración Rural
              </p>

              {/* Active rubros */}
              {loadingMisRubros ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="mb-5">
                  <p className="text-xs font-medium text-gray-600 mb-2">Rubros activos</p>
                  {misRubros.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Sin rubros asignados</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {misRubros.map((rubro) => (
                        <span
                          key={rubro}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {rubro}
                          <button
                            onClick={() => removerMutation.mutate(rubro)}
                            disabled={removerMutation.isPending}
                            className="hover:text-blue-900 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Available rubros to add */}
              {loadingCatalogo ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : rubrosDisponibles.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Agregar rubro</p>
                  <div className="flex flex-wrap gap-2">
                    {rubrosDisponibles.map((rubro) => (
                      <Button
                        key={rubro.nombre}
                        size="sm"
                        variant="outline"
                        onClick={() => asignarMutation.mutate(rubro.nombre)}
                        disabled={asignarMutation.isPending}
                        className="text-xs h-7"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {rubro.nombre}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : misRubros.length > 0 ? (
                <p className="text-xs text-gray-400 italic">Tenés todos los rubros asignados</p>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Producers don't have rubros — show an info card instead */}
        {!isPrestador && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4" />
                Red de Colaboración Rural
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Como productor, podés compartir documentos con prestadores de servicios por rubro.
                Al subir un documento, seleccioná los rubros correspondientes y los prestadores
                registrados en esos rubros podrán acceder automáticamente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
