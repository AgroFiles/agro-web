import { useState, useRef, useCallback } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  useMisClientes,
  useDocumentosDeCliente,
  useEstablecimientosDeCliente,
} from '@/hooks/use-mis-clientes'
import { useRubros } from '@/hooks/use-rubros'
import { downloadFile, viewFile, deleteFile, formatFileSize, uploadFileParaCliente, isImageFile, getThumbnailUrl } from '@/lib/file-api'
import { TIPOS_DOCUMENTO, TIPOS_DOCUMENTO_LABELS } from '@/types/documento'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ClienteConNivel } from '@/lib/cliente-api'
import type { DocumentoMetadata } from '@/types/documento'
import {
  Users,
  Upload,
  Download,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X,
  Plus,
} from 'lucide-react'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png'

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'
interface QueuedFile { id: string; file: File; status: FileStatus; progress: number; error?: string }
function fileId() { return Math.random().toString(36).slice(2) }

// ── Upload dialog (for uploading to a client) ─────────────────────────────────
function UploadParaClienteDialog({
  cliente,
  sharedEstablecimientos,
  onClose,
}: {
  cliente: { id: number; razonSocial: string }
  sharedEstablecimientos: { id: number; nombre: string }[]
  onClose: () => void
}) {
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState('OTRO')
  const [establecimientoId, setEstablecimientoId] = useState<string>('')
  const [rubros, setRubros] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: catalogoRubros = [] } = useRubros()

  const addFiles = useCallback((files: FileList | File[]) => {
    const items: QueuedFile[] = []
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" supera el límite de ${formatFileSize(MAX_FILE_SIZE)}`)
        continue
      }
      items.push({ id: fileId(), file, status: 'pending', progress: 0 })
    }
    if (items.length > 0) setQueue((prev) => [...prev, ...items])
  }, [])

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) { addFiles(e.target.files); e.target.value = '' }
  }

  const updateFile = (id: string, patch: Partial<QueuedFile>) =>
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const toggleRubro = (nombre: string) =>
    setRubros((prev) => prev.includes(nombre) ? prev.filter((r) => r !== nombre) : [...prev, nombre])

  const handleUpload = async () => {
    const pending = queue.filter((f) => f.status === 'pending')
    if (pending.length === 0) return
    setUploading(true)

    await Promise.all(
      pending.map(async ({ id, file }) => {
        updateFile(id, { status: 'uploading', progress: 0 })
        try {
          await uploadFileParaCliente({
            file,
            propietarioId: cliente.id,
            tipoDocumento,
            establecimientoId: establecimientoId ? Number(establecimientoId) : undefined,
            rubros,
            onProgress: (p) => updateFile(id, { progress: p.percentage }),
          })
          updateFile(id, { status: 'done', progress: 100 })
        } catch {
          updateFile(id, { status: 'error', error: 'Error al subir' })
        }
      })
    )

    queryClient.invalidateQueries({ queryKey: ['documentos-cliente', cliente.id] })
    setUploading(false)

    const errors = queue.filter((f) => f.status === 'error')
    if (errors.length === 0) {
      toast.success(pending.length === 1 ? 'Documento subido correctamente' : `${pending.length} documentos subidos`)
      onClose()
    } else {
      toast.error(`${errors.length} archivo${errors.length !== 1 ? 's' : ''} no se pudo${errors.length !== 1 ? 'ron' : ''} subir`)
      setQueue((prev) => prev.filter((f) => f.status === 'error').map((f) => ({ ...f, status: 'pending', progress: 0 })))
    }
  }

  const pendingCount = queue.filter((f) => f.status === 'pending').length
  const allDone = queue.length > 0 && queue.every((f) => f.status === 'done')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh] bg-white shadow-xl">
        <button onClick={() => { if (!uploading) onClose() }} disabled={uploading} className="absolute right-4 top-4 opacity-60 hover:opacity-100 disabled:pointer-events-none">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold mb-1">Subir documento</h2>
        <p className="text-sm text-gray-500 mb-4">
          Para <span className="font-medium">{cliente.razonSocial}</span>
        </p>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 cursor-pointer ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden" multiple accept={ACCEPTED_TYPES} onChange={handleChange} disabled={uploading} />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Arrastrá archivos aquí o{' '}
            <span className="text-blue-600 hover:underline">seleccioná desde tu equipo</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">PDF, JPG o PNG · Máx. {formatFileSize(MAX_FILE_SIZE)} por archivo</p>
        </div>

        {/* File queue */}
        {queue.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500">
                {queue.length} archivo{queue.length !== 1 ? 's' : ''} seleccionado{queue.length !== 1 ? 's' : ''}
              </span>
              {!uploading && pendingCount > 0 && (
                <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Agregar más
                </button>
              )}
            </div>
            {queue.map(({ id, file, status, progress, error }) => (
              <div key={id} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  {status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
                </div>
                {status === 'pending' && !uploading && (
                  <button onClick={() => setQueue((p) => p.filter((f) => f.id !== id))} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />}
                {status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {queue.length > 0 && !allDone && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo de documento</Label>
              <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} disabled={uploading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>{TIPOS_DOCUMENTO_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {sharedEstablecimientos.length > 0 && (
              <div className="space-y-1.5">
                <Label>Establecimiento (opcional)</Label>
                <select value={establecimientoId} onChange={(e) => setEstablecimientoId(e.target.value)} disabled={uploading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Sin establecimiento</option>
                  {sharedEstablecimientos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {catalogoRubros.length > 0 && (
              <div className="space-y-1.5">
                <Label>Rubros (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {catalogoRubros.map((r) => (
                    <button key={r.nombre} type="button" onClick={() => toggleRubro(r.nombre)} disabled={uploading}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        rubros.includes(r.nombre)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}>
                      {r.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => { if (!uploading) onClose() }} disabled={uploading}>
            {allDone ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!allDone && (
            <Button className="flex-1" onClick={handleUpload} disabled={pendingCount === 0 || uploading}>
              {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo...</> : <><Upload className="w-4 h-4 mr-2" />{pendingCount > 1 ? `Subir ${pendingCount} archivos` : 'Subir'}</>}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

// ── Document row ──────────────────────────────────────────────────────────────
function DocumentoRow({
  doc,
  nivelPermiso,
  onDeleted,
}: {
  doc: DocumentoMetadata
  nivelPermiso: 'READ' | 'WRITE' | 'DELETE'
  onDeleted: (id: number) => void
}) {
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      await downloadFile({ documentoId: doc.id, fileName: doc.originalFileName })
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`¿Eliminar "${doc.originalFileName}"?`)) return
    setDeleting(true)
    try {
      await deleteFile(doc.id)
      onDeleted(doc.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer"
      onClick={() => viewFile(doc.id)}
    >
      {doc.hasThumbnail && isImageFile(doc.mimeType) ? (
        <img
          src={getThumbnailUrl(doc.id)}
          alt={doc.originalFileName}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{doc.originalFileName}</p>
        <p className="text-xs text-gray-500">
          {doc.tipoDocumento ? TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento] ?? doc.tipoDocumento : 'Sin tipo'}
          {' · '}{formatFileSize(doc.fileSizeBytes)}
          {doc.cargadoPorUsuarioId && ' · Subido por vos'}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleDownload} disabled={downloading}>
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      </Button>
      {nivelPermiso === 'DELETE' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      )}
    </div>
  )
}

// ── Cliente detail panel ──────────────────────────────────────────────────────
function ClientePanel({
  cliente,
  nivelPermiso,
  onBack,
}: {
  cliente: ClienteConNivel
  nivelPermiso: 'READ' | 'WRITE' | 'DELETE'
  onBack: () => void
}) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { data: documentos = [], isLoading, refetch } = useDocumentosDeCliente(cliente.productorId)
  const { data: establecimientosCliente = [] } = useEstablecimientosDeCliente(cliente.productorId)

  const handleDeleted = () => refetch()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Button>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{cliente.razonSocial}</h3>
          <p className="text-sm text-gray-500">{cliente.email}</p>
        </div>
        {nivelPermiso !== 'READ' && (
          <Button onClick={() => setUploadOpen(true)} size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        )}
      </div>

      {establecimientosCliente.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {establecimientosCliente.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {e.nombre}
            </span>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No hay documentos accesibles de este cliente aún.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">{documentos.length} documento{documentos.length !== 1 ? 's' : ''}</p>
          {documentos.map((doc) => (
            <DocumentoRow key={doc.id} doc={doc} nivelPermiso={nivelPermiso} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      {uploadOpen && nivelPermiso !== 'READ' && (
        <UploadParaClienteDialog
          cliente={{ id: cliente.productorId, razonSocial: cliente.razonSocial }}
          sharedEstablecimientos={establecimientosCliente}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  )
}

// ── Cliente card with lazy establishments ─────────────────────────────────────
function ClienteCard({ cliente, onClick }: { cliente: ClienteConNivel; onClick: () => void }) {
  const { data: establecimientos = [] } = useEstablecimientosDeCliente(cliente.productorId)
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{cliente.razonSocial}</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{cliente.email}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>
      </CardHeader>
      <CardContent>
        {establecimientos.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {establecimientos.map((e) => (
              <span key={e.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                {e.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Sin establecimientos</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MisClientesPage() {
  const [selectedCliente, setSelectedCliente] = useState<ClienteConNivel | null>(null)
  const { data: clientes = [], isLoading, error } = useMisClientes()

  if (selectedCliente) {
    return (
      <AppLayout>
        <ClientePanel
          cliente={selectedCliente}
          nivelPermiso={selectedCliente.nivelPermiso}
          onBack={() => setSelectedCliente(null)}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Clientes</h2>
        <p className="text-gray-500 text-sm mt-1">
          Productores que te compartieron acceso a sus documentos
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 py-8">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Error al cargar los clientes.</span>
        </div>
      ) : clientes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Sin clientes aún</h3>
          <p className="text-sm max-w-sm mx-auto">
            Cuando un productor te autorice en la red de colaboración, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <ClienteCard key={cliente.productorId} cliente={cliente} onClick={() => setSelectedCliente(cliente)} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
