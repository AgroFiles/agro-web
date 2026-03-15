import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  useMisClientes,
  useDocumentosDeCliente,
  useUploadParaCliente,
} from '@/hooks/use-mis-clientes'
import { useEstablecimientos } from '@/hooks/use-establecimientos'
import { useRubros } from '@/hooks/use-rubros'
import { downloadFile, viewFile, deleteFile, formatFileSize, isImageFile, getThumbnailUrl } from '@/lib/file-api'
import { TIPOS_DOCUMENTO, TIPOS_DOCUMENTO_LABELS } from '@/types/documento'
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
  ChevronRight,
  ArrowLeft,
  X,
} from 'lucide-react'

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
  const [file, setFile] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [establecimientoId, setEstablecimientoId] = useState<number | undefined>()
  const [rubros, setRubros] = useState<string[]>([])
  const uploadMutation = useUploadParaCliente()
  const { data: catalogoRubros = [] } = useRubros()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    await uploadMutation.mutateAsync({
      file,
      propietarioId: cliente.id,
      tipoDocumento: tipoDocumento || undefined,
      establecimientoId,
      rubros,
    })
    onClose()
  }

  const toggleRubro = (nombre: string) => {
    setRubros((prev) =>
      prev.includes(nombre) ? prev.filter((r) => r !== nombre) : [...prev, nombre]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh] bg-white shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold mb-1">Subir documento</h2>
        <p className="text-sm text-gray-500 mb-4">
          Para <span className="font-medium">{cliente.razonSocial}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File */}
          <div className="space-y-1.5">
            <Label htmlFor="file">Archivo</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>

          {/* Tipo documento */}
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo de documento</Label>
            <select
              id="tipo"
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Seleccionar tipo...</option>
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t} value={t}>{TIPOS_DOCUMENTO_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Establecimiento */}
          {sharedEstablecimientos.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="estab">Establecimiento</Label>
              <select
                id="estab"
                value={establecimientoId ?? ''}
                onChange={(e) => setEstablecimientoId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin establecimiento</option>
                {sharedEstablecimientos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rubros */}
          {catalogoRubros.length > 0 && (
            <div className="space-y-1.5">
              <Label>Rubros</Label>
              <div className="flex flex-wrap gap-2">
                {catalogoRubros.map((r) => (
                  <button
                    key={r.nombre}
                    type="button"
                    onClick={() => toggleRubro(r.nombre)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      rubros.includes(r.nombre)
                        ? 'bg-green-100 border-green-400 text-green-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {r.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={!file || uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Subir
            </Button>
          </div>
        </form>
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
  sharedEstablecimientos,
  nivelPermiso,
  onBack,
}: {
  cliente: ClienteConNivel
  sharedEstablecimientos: { id: number; nombre: string }[]
  nivelPermiso: 'READ' | 'WRITE' | 'DELETE'
  onBack: () => void
}) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { data: documentos = [], isLoading, refetch } = useDocumentosDeCliente(cliente.productorId)

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

      {sharedEstablecimientos.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {sharedEstablecimientos.map((e) => (
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
          sharedEstablecimientos={sharedEstablecimientos}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MisClientesPage() {
  const [selectedCliente, setSelectedCliente] = useState<ClienteConNivel | null>(null)
  const { data: clientes = [], isLoading, error } = useMisClientes()
  // Establishments shared with the prestador (owner = client)
  const { data: sharedEstablecimientos = [] } = useEstablecimientos()

  const getClienteEstablecimientos = (clienteId: number) =>
    sharedEstablecimientos.filter((e) => e.usuarioOwnerId === clienteId)

  if (selectedCliente) {
    return (
      <AppLayout>
        <ClientePanel
          cliente={selectedCliente}
          sharedEstablecimientos={getClienteEstablecimientos(selectedCliente.productorId)}
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
          Productores que te compartieron acceso a sus establecimientos
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
            Cuando un productor te comparta acceso a un establecimiento, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => {
            const establecimientos = getClienteEstablecimientos(cliente.productorId)
            return (
              <Card
                key={cliente.productorId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCliente(cliente)}
              >
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
                        <span
                          key={e.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                        >
                          {e.nombre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Sin establecimientos compartidos</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
