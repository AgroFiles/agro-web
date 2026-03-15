import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { AppLayout } from '@/components/app-layout'
import { FileUploadDialog } from '@/components/file-upload-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFiles, useDeleteFile, useDownloadFile } from '@/hooks/use-files'
import { useEstablecimientos } from '@/hooks/use-establecimientos'
import { formatFileSize, getThumbnailUrl, isImageFile, viewFile } from '@/lib/file-api'
import { TIPOS_DOCUMENTO_LABELS } from '@/types/documento'
import {
  FileText,
  MapPin,
  Upload,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuthStore()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const { data: documentos = [], isLoading: loadingDocs, error: docsError } = useFiles()
  const { data: establecimientos = [], isLoading: loadingEstabs } = useEstablecimientos()
  const deleteMutation = useDeleteFile()
  const downloadMutation = useDownloadFile()

  const recentDocs = [...documentos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5)

  const handleDownload = (id: number, fileName: string) => {
    downloadMutation.mutate({ documentoId: id, fileName })
  }

  const handleDelete = (id: number, fileName: string) => {
    if (window.confirm(`¿Eliminar "${fileName}"?`)) deleteMutation.mutate(id)
  }

  return (
    <AppLayout>
      {/* Welcome banner */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.razonSocial}
        </h2>
        <p className="text-gray-500 mt-1">
          {user?.tipo === 'PRODUCTOR'
            ? 'Gestiona tus documentos y establecimientos'
            : 'Accedé a los documentos compartidos con vos'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loadingDocs ? '…' : documentos.length}</p>
                <p className="text-sm text-gray-500">Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loadingEstabs ? '…' : establecimientos.length}</p>
                <p className="text-sm text-gray-500">Establecimientos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {loadingDocs ? '…' : formatFileSize(documentos.reduce((a, d) => a + d.fileSizeBytes, 0))}
                </p>
                <p className="text-sm text-gray-500">Almacenado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Documentos Recientes</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-1" />
                  Subir
                </Button>
                <Button size="sm" variant="outline" asChild className="whitespace-nowrap">
                  <Link to="/documentos" className="flex items-center gap-1">
                    Ver todos <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDocs && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
              {docsError && (
                <div className="flex items-center gap-2 py-8 justify-center text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Error al cargar documentos</span>
                </div>
              )}
              {!loadingDocs && !docsError && recentDocs.length === 0 && (
                <div className="text-center py-10">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aún no tienes documentos</p>
                  <Button onClick={() => setUploadDialogOpen(true)} className="mt-3" size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir primer documento
                  </Button>
                </div>
              )}
              {!loadingDocs && !docsError && recentDocs.length > 0 && (
                <div className="space-y-1">
                  {recentDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => viewFile(doc.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {doc.hasThumbnail && isImageFile(doc.mimeType) ? (
                          <img
                            src={getThumbnailUrl(doc.id)}
                            alt={doc.originalFileName}
                            className="w-9 h-9 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.originalFileName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(doc.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            <span>· {TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento] ?? doc.tipoDocumento}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm" variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDownload(doc.id, doc.originalFileName) }}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc.id, doc.originalFileName) }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Establecimientos sidebar */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Establecimientos</CardTitle>
              <Button size="sm" variant="outline" asChild className="whitespace-nowrap">
                <Link to="/establecimientos" className="flex items-center gap-1">
                  Gestionar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingEstabs && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              )}
              {!loadingEstabs && establecimientos.length === 0 && (
                <div className="text-center py-6">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Sin establecimientos</p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link to="/establecimientos">Agregar</Link>
                  </Button>
                </div>
              )}
              {!loadingEstabs && establecimientos.length > 0 && (
                <div className="space-y-2">
                  {establecimientos.slice(0, 4).map((e) => (
                    <div key={e.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-800 truncate">{e.nombre}</span>
                    </div>
                  ))}
                  {establecimientos.length > 4 && (
                    <Link to="/establecimientos" className="text-xs text-blue-600 hover:underline block text-center mt-1">
                      Ver todos ({establecimientos.length})
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        establecimientos={establecimientos}
      />
    </AppLayout>
  )
}
