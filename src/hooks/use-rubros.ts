import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/lib/rubro-api'

export const rubroKeys = {
  all: ['rubros'] as const,
  catalog: () => [...rubroKeys.all, 'catalog'] as const,
  mis: (userId: number) => [...rubroKeys.all, 'mis', userId] as const,
}

export function useRubros() {
  return useQuery({
    queryKey: rubroKeys.catalog(),
    queryFn: api.listRubros,
    staleTime: Infinity, // catalog never changes
  })
}

export function useMisRubros(userId: number) {
  return useQuery({
    queryKey: rubroKeys.mis(userId),
    queryFn: () => api.getMisRubros(userId),
    enabled: !!userId,
  })
}

export function useAsignarRubro(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rubro: string) => api.asignarRubro(userId, rubro),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rubroKeys.mis(userId) })
      toast.success('Rubro asignado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al asignar rubro')
    },
  })
}

export function useRemoverRubro(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rubro: string) => api.removerRubro(userId, rubro),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rubroKeys.mis(userId) })
      toast.success('Rubro removido')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al remover rubro')
    },
  })
}
