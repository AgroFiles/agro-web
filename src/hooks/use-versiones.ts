import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { getVersiones, uploadNewVersion } from '@/lib/file-api'
import type { DocumentoMetadata } from '@/types/documento'

export function useVersiones(documentoId: number | null) {
  return useQuery<DocumentoMetadata[]>({
    queryKey: ['versiones', documentoId],
    queryFn: () => getVersiones(documentoId!),
    enabled: documentoId !== null,
  })
}

export function useUploadNuevaVersion(documentoId: number, onSuccess: () => void) {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = async (file: File) => {
    setUploading(true)
    setProgress(0)
    try {
      await uploadNewVersion(documentoId, file, setProgress)
      queryClient.invalidateQueries({ queryKey: ['files'] })
      queryClient.invalidateQueries({ queryKey: ['versiones', documentoId] })
      toast.success('Nueva versión subida correctamente')
      onSuccess()
    } catch {
      toast.error('Error al subir la nueva versión')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return { upload, uploading, progress }
}
