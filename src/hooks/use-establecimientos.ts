import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/lib/establecimiento-api'

export const establecimientoKeys = {
  all: ['establecimientos'] as const,
  list: () => [...establecimientoKeys.all, 'list'] as const,
}

export function useEstablecimientos() {
  return useQuery({
    queryKey: establecimientoKeys.list(),
    queryFn: api.listEstablecimientos,
  })
}

export function useCreateEstablecimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => api.createEstablecimiento(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establecimientoKeys.list() })
      toast.success('Establecimiento creado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al crear el establecimiento')
    },
  })
}

export function useDeleteEstablecimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteEstablecimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establecimientoKeys.list() })
      toast.success('Establecimiento eliminado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar el establecimiento')
    },
  })
}

export function useCompartirEstablecimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ establecimientoId, usuarioId }: { establecimientoId: number; usuarioId: number }) =>
      api.compartirAccesoEstablecimiento(establecimientoId, usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establecimientoKeys.list() })
      toast.success('Acceso compartido correctamente')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al compartir acceso')
    },
  })
}

export function useRevocarEstablecimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ establecimientoId, usuarioId }: { establecimientoId: number; usuarioId: number }) =>
      api.revocarAccesoEstablecimiento(establecimientoId, usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establecimientoKeys.list() })
      toast.success('Acceso revocado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al revocar acceso')
    },
  })
}
