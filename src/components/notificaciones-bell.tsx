import { useState, useRef, useEffect } from 'react'
import { Bell, FileText, CheckCheck } from 'lucide-react'
import { useNotificaciones, useMarcarLeida, useMarcarTodasLeidas } from '@/hooks/use-notificaciones'
import { viewFile } from '@/lib/file-api'

export function NotificacionesBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: notificaciones = [] } = useNotificaciones()
  const marcarLeidaMutation = useMarcarLeida()
  const marcarTodasMutation = useMarcarTodasLeidas()

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = (id: number, documentoId: number | null, leida: boolean) => {
    if (!leida) marcarLeidaMutation.mutate(id)
    if (documentoId) viewFile(documentoId)
    setOpen(false)
  }

  const handleMarcarTodas = () => {
    marcarTodasMutation.mutate()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              notificaciones.map((n) => {
                const fecha = new Date(n.createdAt).toLocaleDateString('es-ES', {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n.id, n.documentoId, n.leida)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      !n.leida ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-full ${
                      !n.leida ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <FileText className={`w-3.5 h-3.5 ${!n.leida ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${!n.leida ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {n.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{fecha}</p>
                    </div>
                    {!n.leida && (
                      <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
