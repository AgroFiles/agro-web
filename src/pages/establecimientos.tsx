import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useEstablecimientos,
  useCreateEstablecimiento,
  useDeleteEstablecimiento,
  useCompartirEstablecimiento,
  useRevocarEstablecimiento,
} from '@/hooks/use-establecimientos'
import {
  MapPin,
  Plus,
  Trash2,
  Share2,
  Loader2,
  X,
  UserPlus,
} from 'lucide-react'

// ── Create dialog ────────────────────────────────────────────────────────────
function CrearEstablecimientoDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [nombre, setNombre] = useState('')
  const createMutation = useCreateEstablecimiento()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    await createMutation.mutateAsync(nombre.trim())
    setNombre('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-sm p-6 relative bg-white shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold mb-4">Nuevo Establecimiento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre del establecimiento</Label>
            <Input
              id="nombre"
              placeholder="Campo Las Margaritas"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!nombre.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

// ── Compartir dialog ─────────────────────────────────────────────────────────
function CompartirDialog({
  establecimientoId,
  nombre,
  onClose,
}: {
  establecimientoId: number
  nombre: string
  onClose: () => void
}) {
  const [usuarioId, setUsuarioId] = useState('')
  const compartirMutation = useCompartirEstablecimiento()
  const revocarMutation = useRevocarEstablecimiento()

  const handleCompartir = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = Number(usuarioId)
    if (!id) return
    await compartirMutation.mutateAsync({ establecimientoId, usuarioId: id })
    setUsuarioId('')
  }

  const handleRevocar = async () => {
    const id = Number(usuarioId)
    if (!id) return
    await revocarMutation.mutateAsync({ establecimientoId, usuarioId: id })
    setUsuarioId('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-sm p-6 relative bg-white shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold mb-1">Compartir acceso</h2>
        <p className="text-sm text-gray-500 mb-4">{nombre}</p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>ID de usuario</Label>
            <Input
              type="number"
              placeholder="Ingresá el ID del usuario"
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
            />
            <p className="text-xs text-gray-400">
              Podés obtener el ID desde el panel de usuarios
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleCompartir}
              disabled={!usuarioId || compartirMutation.isPending}
            >
              {compartirMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><UserPlus className="w-4 h-4 mr-1" />Dar acceso</>}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRevocar}
              disabled={!usuarioId || revocarMutation.isPending}
            >
              {revocarMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : 'Revocar'}
            </Button>
          </div>
        </div>

        <Button variant="ghost" className="w-full mt-3" onClick={onClose}>
          Cerrar
        </Button>
      </Card>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export function EstablecimientosPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [compartirTarget, setCompartirTarget] = useState<{ id: number; nombre: string } | null>(null)

  const { data: establecimientos = [], isLoading } = useEstablecimientos()
  const deleteMutation = useDeleteEstablecimiento()

  const handleDelete = (id: number, nombre: string) => {
    if (window.confirm(`¿Eliminar el establecimiento "${nombre}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Establecimientos</h2>
          <p className="text-gray-500 text-sm mt-1">Administrá tus campos y compartí acceso</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo establecimiento
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      )}

      {!isLoading && establecimientos.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tenés establecimientos aún</p>
            <p className="text-gray-400 text-sm mt-1">Creá tu primer establecimiento para organizar tus documentos</p>
            <Button onClick={() => setCreateOpen(true)} className="mt-6" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear establecimiento
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && establecimientos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {establecimientos.map((estab) => (
            <Card key={estab.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-base leading-tight">{estab.nombre}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 mb-4">
                  Creado el {new Date(estab.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCompartirTarget({ id: estab.id, nombre: estab.nombre })}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Compartir
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(estab.id, estab.nombre)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CrearEstablecimientoDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      {compartirTarget && (
        <CompartirDialog
          establecimientoId={compartirTarget.id}
          nombre={compartirTarget.nombre}
          onClose={() => setCompartirTarget(null)}
        />
      )}
    </AppLayout>
  )
}
