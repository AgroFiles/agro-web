import { apiClient } from './api-client'
import type {
  DocumentoMetadata,
  DocumentoUploadOptions,
  DocumentoDownloadOptions,
  UploadProgress,
} from '../types/documento'

// ── Tipos re-exportados para compat con hooks existentes ────────────────────
export type { DocumentoUploadOptions as FileUploadOptions }
export type { DocumentoDownloadOptions as FileDownloadOptions }
export type { UploadProgress }
// ───────────────────────────────────────────────────────────────────────────

export async function uploadFile({
  file,
  tipoDocumento,
  establecimientoId,
  rubros = [],
  onProgress,
}: DocumentoUploadOptions): Promise<DocumentoMetadata> {
  const formData = new FormData()
  formData.append('file', file)

  if (tipoDocumento) formData.append('tipoDocumento', tipoDocumento)
  if (establecimientoId) formData.append('establecimientoId', String(establecimientoId))
  rubros.forEach((r) => formData.append('rubros', r))

  const response = await apiClient.post<DocumentoMetadata>('/api/v1/documentos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress: UploadProgress = {
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        }
        onProgress(progress)
      }
    },
  })

  return response.data
}

export interface ClienteUploadOptions extends DocumentoUploadOptions {
  propietarioId: number
}

export async function uploadFileParaCliente({
  file,
  propietarioId,
  tipoDocumento,
  establecimientoId,
  rubros = [],
  onProgress,
}: ClienteUploadOptions): Promise<DocumentoMetadata> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('propietarioId', String(propietarioId))

  if (tipoDocumento) formData.append('tipoDocumento', tipoDocumento)
  if (establecimientoId) formData.append('establecimientoId', String(establecimientoId))
  rubros.forEach((r) => formData.append('rubros', r))

  const response = await apiClient.post<DocumentoMetadata>(
    '/api/v1/documentos/upload-para-cliente',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          })
        }
      },
    }
  )

  return response.data
}

export async function listFiles(): Promise<DocumentoMetadata[]> {
  const response = await apiClient.get<DocumentoMetadata[]>('/api/v1/documentos')
  return response.data
}

export async function getFile(id: number): Promise<DocumentoMetadata> {
  const response = await apiClient.get<DocumentoMetadata>(`/api/v1/documentos/${id}`)
  return response.data
}

export async function downloadFile({ documentoId, fileName }: DocumentoDownloadOptions): Promise<void> {
  const response = await apiClient.get(`/api/v1/documentos/${documentoId}/download`, {
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function viewFile(documentoId: number): Promise<void> {
  const win = window.open('', '_blank')
  const response = await apiClient.get(`/api/v1/documentos/${documentoId}/view`, {
    responseType: 'blob',
  })
  const mimeType = response.headers['content-type'] || 'application/octet-stream'
  const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }))
  if (win) win.location.href = url
  setTimeout(() => window.URL.revokeObjectURL(url), 10000)
}

export async function deleteFile(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/documentos/${id}`)
}

export function getThumbnailUrl(id: number): string {
  const baseUrl = apiClient.defaults.baseURL || ''
  return `${baseUrl}/api/v1/documentos/${id}/thumbnail`
}

export async function compartirDocumento(
  documentoId: number,
  usuarioId: number,
  tipoPermiso: 'READ' | 'WRITE'
): Promise<void> {
  await apiClient.post(`/api/v1/documentos/${documentoId}/permisos`, {
    usuarioId,
    tipoPermiso,
  })
}

export async function revocarPermisoDocumento(
  documentoId: number,
  usuarioId: number
): Promise<void> {
  await apiClient.delete(`/api/v1/documentos/${documentoId}/permisos/${usuarioId}`)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}
