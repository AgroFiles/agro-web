import { useRef, useState } from 'react'
import { X, Clock, Download, Upload, Loader2, History, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useVersiones, useUploadNuevaVersion } from '@/hooks/use-versiones'
import { downloadFile, formatFileSize } from '@/lib/file-api'

interface VersionesDialogProps {
  documentoId: number
  fileName: string
  canUpload: boolean
  onClose: () => void
}

export function VersionesDialog({ documentoId, fileName, canUpload, onClose }: VersionesDialogProps) {
  const { data: versiones = [], isLoading } = useVersiones(documentoId)
  const [downloading, setDownloading] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { upload, uploading, progress } = useUploadNuevaVersion(documentoId, () => {})

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await upload(file)
    e.target.value = ''
  }

  const handleDownload = async (id: number, name: string) => {
    setDownloading(id)
    try {
      await downloadFile({ documentoId: id, fileName: name })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg p-6 relative bg-white shadow-xl max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute right-4 top-4 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Historial de versiones</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5 truncate">{fileName}</p>

        {/* Upload new version */}
        {canUpload && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo... {progress > 0 && `${progress}%`}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir nueva versión
                </>
              )}
            </Button>
            {uploading && progress > 0 && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Version list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : versiones.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No hay versiones disponibles</p>
          ) : (
            versiones.map((v, idx) => {
              const esCurrent = idx === 0
              const fecha = new Date(v.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
              return (
                <div
                  key={v.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    esCurrent ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      esCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      v{v.versionNumero ?? 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.originalFileName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{fecha}</span>
                      <span>·</span>
                      <span>{formatFileSize(v.fileSizeBytes)}</span>
                      {esCurrent && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-blue-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> actual
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(v.id, v.originalFileName)}
                    disabled={downloading === v.id}
                  >
                    {downloading === v.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Download className="w-4 h-4" />}
                  </Button>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>
        </div>
      </Card>
    </div>
  )
}
