import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as fileApi from '../lib/file-api'
import type { DocumentoUploadOptions, DocumentoDownloadOptions } from '../types/documento'

export const fileKeys = {
  all: ['documentos'] as const,
  list: () => [...fileKeys.all, 'list'] as const,
  detail: (id: number) => [...fileKeys.all, 'detail', id] as const,
}

export function useFiles() {
  return useQuery({
    queryKey: fileKeys.list(),
    queryFn: fileApi.listFiles,
  })
}

export function useFile(id: number) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => fileApi.getFile(id),
    enabled: !!id,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options: DocumentoUploadOptions) => fileApi.uploadFile(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list() })
      toast.success('Documento subido correctamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al subir el documento')
    },
  })
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: (options: DocumentoDownloadOptions) => fileApi.downloadFile(options),
    onSuccess: () => {
      toast.success('Documento descargado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al descargar el documento')
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fileApi.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list() })
      toast.success('Documento eliminado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar el documento')
    },
  })
}
