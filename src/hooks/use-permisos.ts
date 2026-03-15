import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPermisos, compartirDocumento, revocarPermisoDocumento } from '@/lib/file-api'
import type { TipoPermiso } from '@/types/documento'

export function usePermisos(documentoId: number | null) {
  return useQuery({
    queryKey: ['permisos', documentoId],
    queryFn: () => getPermisos(documentoId!),
    enabled: documentoId != null,
  })
}

export function useSetPermiso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ documentoId, usuarioId, tipoPermiso }: {
      documentoId: number
      usuarioId: number
      tipoPermiso: TipoPermiso
    }) => compartirDocumento(documentoId, usuarioId, tipoPermiso),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['permisos', vars.documentoId] }),
  })
}

export function useRevocarPermiso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ documentoId, usuarioId }: { documentoId: number; usuarioId: number }) =>
      revocarPermisoDocumento(documentoId, usuarioId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['permisos', vars.documentoId] }),
  })
}
