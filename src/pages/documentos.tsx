import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { FileUploadDialog } from '@/components/file-upload-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useFiles, useDeleteFile, useDownloadFile } from '@/hooks/use-files'
import { useEstablecimientos } from '@/hooks/use-establecimientos'
import { formatFileSize, getThumbnailUrl, isImageFile, viewFile } from '@/lib/file-api'
import { TIPOS_DOCUMENTO_LABELS } from '@/types/documento'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  Clock,
  Filter,
} from 'lucide-react'

const SCAN_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50' },
  CLEAN:    { label: 'Seguro',    color: 'text-green-600 bg-green-50'  },
  INFECTED: { label: 'Infectado', color: 'text-red-600 bg-red-50'     },
  ERROR:    { label: 'Error',     color: 'text-gray-600 bg-gray-50'    },
  SKIPPED:  { label: 'Omitido',   color: 'text-gray-600 bg-gray-50'    },
}

export function DocumentosPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')

  const { data: documentos = [], isLoading, error } = useFiles()
  const { data: establecimientos = [] } = useEstablecimientos()
  const deleteMutation = useDeleteFile()
  const downloadMutation = useDownloadFile()

  const filtered = documentos.filter((doc) => {
    const matchSearch = doc.originalFileName.toLowerCase().includes(search.toLowerCase())
    const matchTipo = tipoFiltro ? doc.tipoDocumento === tipoFiltro : true
    return matchSearch && matchTipo
  })

  const tipos = [...new Set(documentos.map((d) => d.tipoDocumento))]

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
          <p className="text-gray-500 text-sm mt-1">Todos los documentos accesibles para vos</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Subir documento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {tipos.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos los tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{TIPOS_DOCUMENTO_LABELS[t] ?? t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isLoading ? 'Cargando...' : `${filtered.length} documento${filtered.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-2 py-12 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Error al cargar documentos</span>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {search || tipoFiltro ? 'No hay resultados para los filtros aplicados' : 'Aún no tienes documentos'}
              </p>
              {!search && !tipoFiltro && (
                <Button onClick={() => setUploadOpen(true)} variant="outline" size="sm" className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir primer documento
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filtered.map((doc) => {
                const scan = SCAN_STATUS_LABELS[doc.scanStatus]
                const fecha = new Date(doc.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 py-3 group cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2"
                    onClick={() => viewFile(doc.id)}
                  >
                    {/* Thumbnail / Icon */}
                    {doc.hasThumbnail && isImageFile(doc.mimeType) ? (
                      <img
                        src={getThumbnailUrl(doc.id)}
                        alt={doc.originalFileName}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.originalFileName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fecha}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500">
                          {TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento] ?? doc.tipoDocumento}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{formatFileSize(doc.fileSizeBytes)}</span>
                        {doc.rubros?.length > 0 && (
                          <>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-blue-600">{doc.rubros.join(', ')}</span>
                          </>
                        )}
                        {scan && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${scan.color}`}>
                            {scan.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => { e.stopPropagation(); downloadMutation.mutate({ documentoId: doc.id, fileName: doc.originalFileName }) }}
                        disabled={downloadMutation.isPending}
                        title="Descargar"
                      >
                        {downloadMutation.isPending
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Download className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(`¿Eliminar "${doc.originalFileName}"?`)) {
                            deleteMutation.mutate(doc.id)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <FileUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        establecimientos={establecimientos}
      />
    </AppLayout>
  )
}
