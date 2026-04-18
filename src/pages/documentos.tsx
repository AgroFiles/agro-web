import { useState } from 'react'
import { AppLayout } from '@/components/app-layout'
import { FileUploadDialog } from '@/components/file-upload-dialog'
import { PermisosDocumentoDialog } from '@/components/permisos-documento-dialog'
import { VersionesDialog } from '@/components/versiones-dialog'
import { DocumentoViewer } from '@/components/documento-viewer'
import { DatosExtraídosModal } from '@/components/datos-extraidos-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useFiles, useDeleteFile, useDownloadFile } from '@/hooks/use-files'
import { useEstablecimientos } from '@/hooks/use-establecimientos'
import { useRubros } from '@/hooks/use-rubros'
import { useAuthStore } from '@/store/auth-store'
import { formatFileSize, getThumbnailUrl, isImageFile, generateShareLink } from '@/lib/file-api'
import { TIPOS_DOCUMENTO_LABELS } from '@/types/documento'
import type { DocumentoMetadata, RomaneoRow } from '@/types/documento'
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
  Users,
  List,
  CalendarDays,
  X,
  History,
  ChevronLeft,
  ChevronRight,
  Link2,
  ChevronDown,
  ChevronUp,
  TableIcon,
  FileJson,
} from 'lucide-react'

const SCAN_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50' },
  CLEAN:    { label: 'Seguro',    color: 'text-green-600 bg-green-50'  },
  INFECTED: { label: 'Infectado', color: 'text-red-600 bg-red-50'     },
  ERROR:    { label: 'Error',     color: 'text-gray-600 bg-gray-50'    },
  SKIPPED:  { label: 'Omitido',   color: 'text-gray-600 bg-gray-50'    },
}

// ── Single document row (shared between list and history views) ───────────────
function DocumentoRow({
  doc,
  onPermisos,
  onDelete,
  onDownload,
  onVersiones,
  onShare,
  onView,
  onVerDatos,
  isOwner,
  canWrite,
}: {
  doc: DocumentoMetadata
  onPermisos: (id: number, name: string) => void
  onDelete: (id: number, name: string) => void
  onDownload: (id: number, name: string) => void
  onVersiones: (id: number, name: string) => void
  onShare: (id: number) => void
  onView: (id: number, name: string) => void
  onVerDatos: (doc: DocumentoMetadata) => void
  isOwner: boolean
  canWrite: boolean
}) {
  const scan = SCAN_STATUS_LABELS[doc.scanStatus]

  const handleExportJson = (e: React.MouseEvent) => {
    e.stopPropagation()
    const json = JSON.stringify(doc.datosExtraidos, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.originalFileName.replace(/\.[^/.]+$/, '')}_datos.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const fecha = new Date(doc.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
  const estabNombre = doc.establecimientoNombre
  const version = doc.versionNumero ?? 1
  const romaneoRows = doc.datosExtraidos?.data

  return (
    <div className="rounded-lg px-2 -mx-2 hover:bg-gray-50">
    <div
      className="flex items-center gap-3 py-3 group cursor-pointer"
      onClick={() => onView(doc.id, doc.originalFileName)}
    >
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{doc.originalFileName}</p>
          {version > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onVersiones(doc.id, doc.originalFileName) }}
              className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
              title="Ver historial de versiones"
            >
              v{version}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fecha}
          </span>
          {doc.tipoDocumento && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento] ?? doc.tipoDocumento}</span>
            </>
          )}
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{formatFileSize(doc.fileSizeBytes)}</span>
          {estabNombre && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{estabNombre}</span>
            </>
          )}
          {doc.rubros?.length > 0 && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-blue-600">{doc.rubros.join(', ')}</span>
            </>
          )}
          {scan && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${scan.color}`}>{scan.label}</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {romaneoRows && romaneoRows.length > 0 && (
          <>
            <Button
              size="sm" variant="ghost"
              onClick={(e) => { e.stopPropagation(); onVerDatos(doc) }}
              title="Ver datos extraídos"
            >
              <TableIcon className="w-4 h-4 text-blue-500" />
            </Button>
            <Button
              size="sm" variant="ghost"
              onClick={handleExportJson}
              title="Exportar datos como JSON"
            >
              <FileJson className="w-4 h-4 text-emerald-500" />
            </Button>
          </>
        )}
        {canWrite && (
          <Button
            size="sm" variant="ghost"
            onClick={(e) => { e.stopPropagation(); onVersiones(doc.id, doc.originalFileName) }}
            title="Versiones"
          >
            <History className="w-4 h-4 text-gray-500" />
          </Button>
        )}
        {isOwner && (
          <Button
            size="sm" variant="ghost"
            onClick={(e) => { e.stopPropagation(); onPermisos(doc.id, doc.originalFileName) }}
            title="Gestionar acceso"
          >
            <Users className="w-4 h-4 text-gray-500" />
          </Button>
        )}
        <Button
          size="sm" variant="ghost"
          onClick={(e) => { e.stopPropagation(); onDownload(doc.id, doc.originalFileName) }}
          title="Descargar"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          size="sm" variant="ghost"
          onClick={(e) => { e.stopPropagation(); onShare(doc.id) }}
          title="Compartir por link"
        >
          <Link2 className="w-4 h-4 text-gray-500" />
        </Button>
        <Button
          size="sm" variant="ghost"
          onClick={(e) => { e.stopPropagation(); onDelete(doc.id, doc.originalFileName) }}
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </Button>
      </div>
    </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function DocumentosPage() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [permisosDocId, setPermisosDocId] = useState<number | null>(null)
  const [permisosFileName, setPermisosFileName] = useState('')
  const [versionesDoc, setVersionesDoc] = useState<{ id: number; name: string } | null>(null)
  const [viewerDoc, setViewerDoc] = useState<{ id: number; name: string } | null>(null)
  const [datosDoc, setDatosDoc] = useState<DocumentoMetadata | null>(null)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [rubroFiltro, setRubroFiltro] = useState('')
  const [establecimientoFiltro, setEstablecimientoFiltro] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [vista, setVista] = useState<'lista' | 'historial'>('lista')
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 20

  const { user } = useAuthStore()
  const { data: documentos = [], isLoading, error } = useFiles()
  const { data: establecimientos = [] } = useEstablecimientos()
  const { data: rubros = [] } = useRubros()
  const deleteMutation = useDeleteFile()
  const downloadMutation = useDownloadFile()

  // Enrich documents with establishment name
  const estabMap = Object.fromEntries(establecimientos.map((e) => [e.id, e.nombre]))
  const documentosEnriquecidos = documentos.map((d) => ({
    ...d,
    establecimientoNombre: d.establecimientoId ? estabMap[d.establecimientoId] : undefined,
  }))

  const hayFiltros = !!(search || tipoFiltro || rubroFiltro || establecimientoFiltro || fechaDesde || fechaHasta)

  // Reset page when filters change
  const resetPagina = () => setPagina(1)

  const filtered = documentosEnriquecidos.filter((doc) => {
    const matchSearch = doc.originalFileName.toLowerCase().includes(search.toLowerCase())
    const matchTipo = tipoFiltro ? doc.tipoDocumento === tipoFiltro : true
    const matchRubro = rubroFiltro ? doc.rubros?.includes(rubroFiltro) : true
    const matchEstablecimiento = establecimientoFiltro
      ? doc.establecimientoId === Number(establecimientoFiltro)
      : true
    const docDate = new Date(doc.createdAt)
    const matchDesde = fechaDesde ? docDate >= new Date(fechaDesde) : true
    const matchHasta = fechaHasta ? docDate <= new Date(fechaHasta + 'T23:59:59') : true
    return matchSearch && matchTipo && matchRubro && matchEstablecimiento && matchDesde && matchHasta
  })

  const sortedByDate = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const totalPaginas = Math.ceil(sortedByDate.length / POR_PAGINA)
  const paginados = sortedByDate.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  // Group by month-year for history view
  const groupedByMonth = sortedByDate.reduce<Record<string, typeof filtered>>((acc, doc) => {
    const date = new Date(doc.createdAt)
    const key = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    if (!acc[key]) acc[key] = []
    acc[key].push(doc)
    return acc
  }, {})

  const tipos = [...new Set(documentos.map((d) => d.tipoDocumento).filter(Boolean))]
  const rubrosDisponibles = rubros.filter((r) =>
    documentos.some((d) => d.rubros?.includes(r.nombre))
  )
  const establecimientosDisponibles = establecimientos.filter((e) =>
    documentos.some((d) => d.establecimientoId === e.id)
  )

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Eliminar "${name}"?`)) deleteMutation.mutate(id)
  }

  const handleDownload = (id: number, name: string) => {
    downloadMutation.mutate({ documentoId: id, fileName: name })
  }

  const handleShare = async (id: number) => {
    try {
      const token = await generateShareLink(id)
      const url = `${window.location.origin}/doc/${token}`
      await navigator.clipboard.writeText(url)
      alert('Link copiado al portapapeles')
    } catch {
      alert('No se pudo generar el link')
    }
  }

  const rowProps = (doc: typeof filtered[0]) => {
    const isOwner = user?.tipo === 'PRODUCTOR' && doc.usuarioOwnerId === user?.id
    return {
      doc,
      onPermisos: (id: number, name: string) => { setPermisosDocId(id); setPermisosFileName(name) },
      onDelete: handleDelete,
      onDownload: handleDownload,
      onVersiones: (id: number, name: string) => setVersionesDoc({ id, name }),
      onView: (id: number, name: string) => setViewerDoc({ id, name }),
      onVerDatos: (doc: DocumentoMetadata) => setDatosDoc(doc),
      onShare: handleShare,
      isOwner,
      canWrite: isOwner,
    }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
          <p className="text-gray-500 text-sm mt-1">Todos los documentos accesibles para vos</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setVista('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                vista === 'lista' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
            <button
              onClick={() => setVista('historial')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                vista === 'historial' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Historial
            </button>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPagina() }}
            />
          </div>

          {/* Tipo */}
          {tipos.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={tipoFiltro}
                onChange={(e) => { setTipoFiltro(e.target.value); resetPagina() }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos los tipos</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>{TIPOS_DOCUMENTO_LABELS[t] ?? t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Establecimiento */}
          {establecimientosDisponibles.length > 0 && (
            <select
              value={establecimientoFiltro}
              onChange={(e) => { setEstablecimientoFiltro(e.target.value); resetPagina() }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos los establecimientos</option>
              {establecimientosDisponibles.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          )}
        </div>

        {/* Rango de fechas — solo en historial */}
        {vista === 'historial' && (
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">Desde</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => { setFechaDesde(e.target.value); resetPagina() }}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
            <span className="text-xs text-gray-500">hasta</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => { setFechaHasta(e.target.value); resetPagina() }}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
            {(fechaDesde || fechaHasta) && (
              <button
                onClick={() => { setFechaDesde(''); setFechaHasta(''); resetPagina() }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> limpiar
              </button>
            )}
          </div>
        )}

        {/* Rubro pills */}
        {rubrosDisponibles.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Rubro:</span>
            {rubrosDisponibles.map((r) => (
              <button
                key={r.nombre}
                onClick={() => { setRubroFiltro(rubroFiltro === r.nombre ? '' : r.nombre); resetPagina() }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  rubroFiltro === r.nombre
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {r.nombre}
              </button>
            ))}
            {rubroFiltro && (
              <button onClick={() => { setRubroFiltro(''); resetPagina() }} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                <X className="w-3 h-3" /> limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
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
        <div className="text-center py-20">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {hayFiltros ? 'No hay resultados para los filtros aplicados' : 'Aún no tienes documentos'}
          </p>
          {!hayFiltros && (
            <Button onClick={() => setUploadOpen(true)} variant="outline" size="sm" className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Subir primer documento
            </Button>
          )}
        </div>
      )}

      {/* ── VISTA LISTA ── */}
      {!isLoading && !error && filtered.length > 0 && vista === 'lista' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</span>
                {totalPaginas > 1 && (
                  <span className="text-xs font-normal text-gray-400">
                    Página {pagina} de {totalPaginas}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {paginados.map((doc) => (
                  <DocumentoRow key={doc.id} {...rowProps(doc)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline" size="sm"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="text-gray-400 text-sm px-1">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={pagina === p ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setPagina(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline" size="sm"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── VISTA HISTORIAL ── */}
      {!isLoading && !error && filtered.length > 0 && vista === 'historial' && (
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([mes, docs]) => (
            <div key={mes}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700 capitalize">{mes}</h3>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {docs.length} doc{docs.length !== 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <Card>
                <CardContent className="pt-4">
                  <div className="divide-y divide-gray-100">
                    {docs.map((doc) => (
                      <DocumentoRow key={doc.id} {...rowProps(doc)} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <FileUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        establecimientos={establecimientos}
      />

      {permisosDocId && (
        <PermisosDocumentoDialog
          documentoId={permisosDocId}
          fileName={permisosFileName}
          onClose={() => setPermisosDocId(null)}
        />
      )}

      {versionesDoc && (
        <VersionesDialog
          documentoId={versionesDoc.id}
          fileName={versionesDoc.name}
          canUpload={true}
          onClose={() => setVersionesDoc(null)}
        />
      )}

      {viewerDoc && (
        <DocumentoViewer
          documentoId={viewerDoc.id}
          fileName={viewerDoc.name}
          onClose={() => setViewerDoc(null)}
        />
      )}

      {datosDoc && (
        <DatosExtraídosModal
          doc={datosDoc}
          onClose={() => setDatosDoc(null)}
        />
      )}
    </AppLayout>
  )
}
