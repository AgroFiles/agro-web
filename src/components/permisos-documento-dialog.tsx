import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { usePermisos, useSetPermiso, useRevocarPermiso } from '@/hooks/use-permisos'
import { apiClient } from '@/lib/api-client'
import type { PermisoConUsuario, TipoPermiso } from '@/types/documento'
import { TIPO_PERMISO_LABELS } from '@/types/documento'
import type { User } from '@/types/user'
import { X, Search, Loader2, Users, ShieldCheck } from 'lucide-react'

const NIVELES: TipoPermiso[] = ['READ', 'WRITE', 'DELETE']

const NIVEL_COLOR: Record<TipoPermiso, string> = {
  READ:   'bg-blue-50 text-blue-700',
  WRITE:  'bg-yellow-50 text-yellow-700',
  DELETE: 'bg-red-50 text-red-700',
}

export function PermisosDocumentoDialog({
  documentoId,
  fileName,
  onClose,
}: {
  documentoId: number
  fileName: string
  onClose: () => void
}) {
  const { data: permisos = [], isLoading } = usePermisos(documentoId)
  const setPermisoMutation = useSetPermiso()
  const revocarMutation = useRevocarPermiso()

  // Búsqueda de prestador para agregar
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [encontrado, setEncontrado] = useState<User | null>(null)
  const [searchError, setSearchError] = useState('')
  const [nuevoNivel, setNuevoNivel] = useState<TipoPermiso>('READ')

  const buscar = async () => {
    if (!email.trim()) return
    setSearching(true)
    setSearchError('')
    setEncontrado(null)
    try {
      const res = await apiClient.get<User[]>('/api/v1/usuarios?tipo=PRESTADOR_DE_SERVICIOS')
      const match = res.data.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (match) {
        setEncontrado(match)
      } else {
        setSearchError('No se encontró ningún prestador con ese email')
      }
    } catch {
      setSearchError('Error al buscar')
    } finally {
      setSearching(false)
    }
  }

  const handleDarAcceso = async () => {
    if (!encontrado) return
    await setPermisoMutation.mutateAsync({ documentoId, usuarioId: encontrado.id, tipoPermiso: nuevoNivel })
    setEncontrado(null)
    setEmail('')
  }

  const handleCambiarNivel = (p: PermisoConUsuario, nivel: TipoPermiso) => {
    setPermisoMutation.mutate({ documentoId, usuarioId: p.usuarioId, tipoPermiso: nivel })
  }

  const handleRevocar = (p: PermisoConUsuario) => {
    revocarMutation.mutate({ documentoId, usuarioId: p.usuarioId })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg p-6 relative bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold mb-0.5">Gestionar acceso</h2>
        <p className="text-sm text-gray-500 mb-5 truncate">{fileName}</p>

        {/* ── Agregar prestador ── */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dar acceso a un prestador</p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="email del prestador"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
            />
            <Button type="button" variant="outline" onClick={buscar} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {searchError && <p className="text-sm text-red-500 mb-2">{searchError}</p>}

          {encontrado && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{encontrado.razonSocial}</p>
                <p className="text-xs text-green-600">{encontrado.email}</p>
              </div>
              <select
                value={nuevoNivel}
                onChange={(e) => setNuevoNivel(e.target.value as TipoPermiso)}
                className="rounded border border-green-300 bg-white text-sm px-2 py-1"
              >
                {NIVELES.map((n) => (
                  <option key={n} value={n}>{TIPO_PERMISO_LABELS[n]}</option>
                ))}
              </select>
              <Button size="sm" onClick={handleDarAcceso} disabled={setPermisoMutation.isPending}>
                {setPermisoMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Dar acceso'}
              </Button>
            </div>
          )}
        </div>

        {/* ── Personas con acceso ── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Personas con acceso</p>

          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}

          {!isLoading && (permisos as PermisoConUsuario[]).length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nadie tiene acceso directo aún</p>
            </div>
          )}

          <div className="space-y-2">
            {(permisos as PermisoConUsuario[]).map((p) => (
              <div key={p.usuarioId} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.razonSocial}</p>
                  <p className="text-xs text-gray-500 truncate">{p.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NIVEL_COLOR[p.tipoPermiso]}`}>
                  {TIPO_PERMISO_LABELS[p.tipoPermiso]}
                </span>
                <select
                  value={p.tipoPermiso}
                  onChange={(e) => handleCambiarNivel(p, e.target.value as TipoPermiso)}
                  disabled={setPermisoMutation.isPending}
                  className="rounded border border-gray-200 text-sm px-2 py-1 bg-white"
                >
                  {NIVELES.map((n) => (
                    <option key={n} value={n}>{TIPO_PERMISO_LABELS[n]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRevocar(p)}
                  disabled={revocarMutation.isPending}
                  className="p-1 rounded hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"
                  title="Revocar acceso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </Card>
    </div>
  )
}
