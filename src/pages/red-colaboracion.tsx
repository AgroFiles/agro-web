import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAutorizaciones,
  useAutorizarPrestador,
  useActualizarNivel,
  useRevocarPrestador,
  useRevocarRubro,
} from '@/hooks/use-autorizaciones'
import { TIPO_PERMISO_LABELS } from '@/types/documento'
import type { TipoPermiso } from '@/types/documento'
import { useRubros } from '@/hooks/use-rubros'
import { apiClient } from '@/lib/api-client'
import type { User } from '@/types/user'
import {
  Users,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Search,
  ShieldCheck,
  Pencil,
} from 'lucide-react'

const RUBRO_LABELS: Record<string, string> = {
  GANADERIA:   'Ganadería',
  AGRICULTURA: 'Agricultura',
  TRANSPORTE:  'Transporte',
  FAENA:       'Faena',
  VETERINARIA: 'Veterinaria',
  LABORATORIO: 'Laboratorio',
}

// ── Authorize / Edit dialog ───────────────────────────────────────────────────
function AutorizarDialog({
  onClose,
  prestadorInicial,
  rubrosActuales = [],
  nivelActual = 'READ',
}: {
  onClose: () => void
  prestadorInicial?: User
  rubrosActuales?: string[]
  nivelActual?: TipoPermiso
}) {
  const modoEdicion = !!prestadorInicial
  const [emailSearch, setEmailSearch] = useState('')
  const [prestadorEncontrado, setPrestadorEncontrado] = useState<User | null>(prestadorInicial ?? null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState<string[]>([])
  const [nivelSeleccionado, setNivelSeleccionado] = useState<TipoPermiso>(nivelActual)
  const { data: catalogo = [] } = useRubros()
  const autorizarMutation = useAutorizarPrestador()
  const actualizarNivelMutation = useActualizarNivel()

  const buscarPrestador = async () => {
    if (!emailSearch.trim()) return
    setSearching(true)
    setSearchError('')
    setPrestadorEncontrado(null)
    try {
      const response = await apiClient.get<User[]>(`/api/v1/usuarios?tipo=PRESTADOR_DE_SERVICIOS`)
      const encontrado = response.data.find(
        (u) => u.email.toLowerCase() === emailSearch.trim().toLowerCase()
      )
      if (encontrado) {
        setPrestadorEncontrado(encontrado)
      } else {
        setSearchError('No se encontró ningún prestador con ese email')
      }
    } catch {
      setSearchError('Error al buscar el prestador')
    } finally {
      setSearching(false)
    }
  }

  const toggleRubro = (nombre: string) => {
    setRubrosSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((r) => r !== nombre) : [...prev, nombre]
    )
  }

  const handleAutorizar = async () => {
    if (!prestadorEncontrado) return
    if (!modoEdicion && rubrosSeleccionados.length === 0) return

    if (modoEdicion) {
      // Update nivel if it changed
      if (nivelSeleccionado !== nivelActual) {
        await actualizarNivelMutation.mutateAsync({
          prestadorId: prestadorEncontrado.id,
          nivelPermiso: nivelSeleccionado,
        })
      }
      // Add new rubros if selected
      if (rubrosSeleccionados.length > 0) {
        await autorizarMutation.mutateAsync({
          prestadorId: prestadorEncontrado.id,
          rubros: rubrosSeleccionados,
          nivelPermiso: nivelSeleccionado,
        })
      }
    } else {
      await autorizarMutation.mutateAsync({
        prestadorId: prestadorEncontrado.id,
        rubros: rubrosSeleccionados,
        nivelPermiso: nivelSeleccionado,
      })
    }
    onClose()
  }

  // Rubros que no tiene aún (los que puede agregar)
  const rubrosSinAutorizar = catalogo.filter((r) => !rubrosActuales.includes(r.nombre))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-md p-6 relative bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold mb-4">
          {modoEdicion ? 'Editar autorización' : 'Autorizar Prestador'}
        </h2>

        {/* Búsqueda (solo en modo nuevo) */}
        {!modoEdicion && (
          <div className="space-y-2 mb-4">
            <Label>Email del prestador</Label>
            <div className="flex gap-2">
              <Input
                placeholder="prestador@ejemplo.com"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarPrestador()}
              />
              <Button type="button" variant="outline" onClick={buscarPrestador} disabled={searching}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            {searchError && <p className="text-sm text-red-500">{searchError}</p>}
          </div>
        )}

        {prestadorEncontrado && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">{prestadorEncontrado.razonSocial}</p>
                <p className="text-xs text-green-600">{prestadorEncontrado.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{modoEdicion ? 'Agregar rubros' : 'Rubros a compartir'}</Label>

              {/* Rubros ya autorizados (solo en modo edición) */}
              {modoEdicion && rubrosActuales.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">Ya autorizados:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rubrosActuales.map((r) => (
                      <span key={r} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                        {RUBRO_LABELS[r] ?? r} ✓
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                {modoEdicion
                  ? 'Seleccioná los rubros adicionales a agregar.'
                  : 'El prestador solo podrá ver tus documentos de los rubros que selecciones.'}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {(modoEdicion ? rubrosSinAutorizar : catalogo).map((r) => (
                  <button
                    key={r.nombre}
                    type="button"
                    onClick={() => toggleRubro(r.nombre)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      rubrosSeleccionados.includes(r.nombre)
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {RUBRO_LABELS[r.nombre] ?? r.nombre}
                  </button>
                ))}
                {modoEdicion && rubrosSinAutorizar.length === 0 && (
                  <p className="text-sm text-gray-500">Ya tiene acceso a todos los rubros.</p>
                )}
              </div>
            </div>

            {/* Nivel de permiso */}
            <div className="space-y-1.5">
              <Label>Nivel de acceso</Label>
              <select
                value={nivelSeleccionado}
                onChange={(e) => setNivelSeleccionado(e.target.value as TipoPermiso)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="READ">Lectura — puede ver y descargar</option>
                <option value="WRITE">Modificación — puede subir y editar</option>
                <option value="DELETE">Eliminación — puede eliminar también</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
              <Button
                className="flex-1"
                disabled={
                  (modoEdicion
                    ? rubrosSeleccionados.length === 0 && nivelSeleccionado === nivelActual
                    : rubrosSeleccionados.length === 0) ||
                  autorizarMutation.isPending ||
                  actualizarNivelMutation.isPending
                }
                onClick={handleAutorizar}
              >
                {(autorizarMutation.isPending || actualizarNivelMutation.isPending)
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : modoEdicion ? 'Guardar' : 'Autorizar'}
              </Button>
            </div>
          </div>
        )}

        {!prestadorEncontrado && (
          <Button variant="outline" className="w-full" onClick={onClose}>Cancelar</Button>
        )}
      </Card>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function RedColaboracionPage() {
  const [autorizarOpen, setAutorizarOpen] = useState(false)
  const [editando, setEditando] = useState<{ prestador: User; rubros: string[]; nivelPermiso: TipoPermiso } | null>(null)
  const { data: autorizaciones = [], isLoading, error } = useAutorizaciones()
  const revocarPrestadorMutation = useRevocarPrestador()
  const revocarRubroMutation = useRevocarRubro()

  const handleRevocarPrestador = (prestadorId: number, razonSocial: string) => {
    if (window.confirm(`¿Revocar todo el acceso de "${razonSocial}"?`)) {
      revocarPrestadorMutation.mutate(prestadorId)
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Red de Colaboración Rural</h2>
          <p className="text-gray-500 text-sm mt-1">
            Controlá qué prestadores pueden ver tus documentos y en qué rubros
          </p>
        </div>
        <Button onClick={() => setAutorizarOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Autorizar prestador
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 py-8">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Error al cargar las autorizaciones.</span>
        </div>
      )}

      {!isLoading && !error && autorizaciones.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Sin prestadores autorizados</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Podés autorizar a frigoríficos, veterinarios, transportistas u otros prestadores
            para que accedan a documentos específicos de tu establecimiento.
          </p>
          <Button onClick={() => setAutorizarOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Autorizar primer prestador
          </Button>
        </div>
      )}

      {!isLoading && autorizaciones.length > 0 && (
        <div className="space-y-4">
          {autorizaciones.map((aut) => (
            <Card key={aut.prestadorId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{aut.razonSocial}</CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{aut.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                      aut.nivelPermiso === 'DELETE' ? 'bg-red-50 text-red-700 border border-red-200'
                      : aut.nivelPermiso === 'WRITE' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {TIPO_PERMISO_LABELS[aut.nivelPermiso as TipoPermiso] ?? aut.nivelPermiso}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditando({
                        prestador: { id: aut.prestadorId, razonSocial: aut.razonSocial, email: aut.email, tipo: 'PRESTADOR_DE_SERVICIOS', estado: 'ACTIVO' },
                        rubros: aut.rubros,
                        nivelPermiso: (aut.nivelPermiso as TipoPermiso) ?? 'READ',
                      })}
                      title="Editar autorización"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevocarPrestador(aut.prestadorId, aut.razonSocial)}
                      disabled={revocarPrestadorMutation.isPending}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-2">Rubros autorizados:</p>
                <div className="flex flex-wrap gap-2">
                  {aut.rubros.map((rubro) => (
                    <span
                      key={rubro}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 border border-green-200 text-green-800"
                    >
                      {RUBRO_LABELS[rubro] ?? rubro}
                      <button
                        onClick={() =>
                          revocarRubroMutation.mutate({ prestadorId: aut.prestadorId, rubro })
                        }
                        disabled={revocarRubroMutation.isPending}
                        className="hover:text-red-600 transition-colors"
                        title={`Revocar acceso a ${rubro}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {autorizarOpen && <AutorizarDialog onClose={() => setAutorizarOpen(false)} />}
      {editando && (
        <AutorizarDialog
          prestadorInicial={editando.prestador}
          rubrosActuales={editando.rubros}
          nivelActual={editando.nivelPermiso}
          onClose={() => setEditando(null)}
        />
      )}
    </AppLayout>
  )
}
