import { useEffect, useState } from 'react'
import { X, Loader2, FileX } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface DocumentoViewerProps {
  documentoId: number
  fileName: string
  onClose: () => void
}

export function DocumentoViewer({ documentoId, fileName, onClose }: DocumentoViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let url: string | null = null

    apiClient
      .get(`/api/v1/documentos/${documentoId}/view`, { responseType: 'blob' })
      .then((res) => {
        const mime = res.headers['content-type'] || 'application/octet-stream'
        url = window.URL.createObjectURL(new Blob([res.data], { type: mime }))
        setMimeType(mime)
        setBlobUrl(url)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    return () => {
      if (url) window.URL.revokeObjectURL(url)
    }
  }, [documentoId])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isPdf = mimeType === 'application/pdf'
  const isImage = mimeType.startsWith('image/')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80" onClick={onClose}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm font-medium truncate max-w-[80%]">{fileName}</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm text-gray-300">Cargando archivo...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-white">
            <FileX className="w-10 h-10 text-gray-400" />
            <span className="text-sm text-gray-300">No se pudo cargar el archivo</span>
          </div>
        )}

        {!loading && !error && blobUrl && isPdf && (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0"
            title={fileName}
          />
        )}

        {!loading && !error && blobUrl && isImage && (
          <img
            src={blobUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {!loading && !error && blobUrl && !isPdf && !isImage && (
          <div className="flex flex-col items-center gap-3 text-white">
            <FileX className="w-10 h-10 text-gray-400" />
            <span className="text-sm text-gray-300">
              Este tipo de archivo no se puede previsualizar
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
