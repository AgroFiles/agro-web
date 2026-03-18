import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '@/lib/api-client'
import { formatFileSize } from '@/lib/file-api'
import type { DocumentoMetadata } from '@/types/documento'
import { TIPOS_DOCUMENTO_LABELS } from '@/types/documento'
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DocPublicoPage() {
  const { token } = useParams<{ token: string }>()
  const [doc, setDoc] = useState<DocumentoMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!token) return
    apiClient
      .get<DocumentoMetadata>(`/api/v1/documentos/public/${token}`)
      .then((r) => setDoc(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  const handleDownload = async () => {
    if (!doc || !token) return
    const response = await apiClient.get(`/api/v1/documentos/public/${token}/download`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = doc.originalFileName
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AgroLinks</h1>
            <p className="text-sm text-gray-500">Documento compartido</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-gray-600">Este link no es válido o el documento ya no está disponible.</p>
          </div>
        )}

        {doc && !loading && (
          <div className="space-y-4">
            {doc.ownerRazonSocial && (
              <p className="text-sm text-gray-500">
                Documento de <span className="font-medium text-gray-700">{doc.ownerRazonSocial}</span>
              </p>
            )}
            <div className="border rounded-lg p-4 space-y-2">
              <p className="font-medium text-gray-900 break-all">{doc.originalFileName}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span>{formatFileSize(doc.fileSizeBytes)}</span>
                {doc.tipoDocumento && (
                  <>
                    <span>·</span>
                    <span>{TIPOS_DOCUMENTO_LABELS[doc.tipoDocumento] ?? doc.tipoDocumento}</span>
                  </>
                )}
                {doc.mimeType && (
                  <>
                    <span>·</span>
                    <span>{doc.mimeType}</span>
                  </>
                )}
              </div>
              {doc.rubros?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {doc.rubros.map((r) => (
                    <span key={r} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Descargar documento
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
