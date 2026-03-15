import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  listAutorizaciones,
  autorizarPrestador,
  actualizarNivelPrestador,
  revocarPrestador,
  revocarRubro,
} from '@/lib/autorizacion-api'

export function useAutorizaciones() {
  return useQuery({
    queryKey: ['autorizaciones'],
    queryFn: listAutorizaciones,
  })
}

export function useAutorizarPrestador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ prestadorId, rubros, nivelPermiso }: { prestadorId: number; rubros: string[]; nivelPermiso?: string }) =>
      autorizarPrestador(prestadorId, rubros, nivelPermiso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] })
      toast.success('Prestador autorizado correctamente')
    },
    onError: () => toast.error('Error al autorizar prestador'),
  })
}

export function useActualizarNivel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ prestadorId, nivelPermiso }: { prestadorId: number; nivelPermiso: string }) =>
      actualizarNivelPrestador(prestadorId, nivelPermiso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] })
      toast.success('Nivel de permiso actualizado')
    },
    onError: () => toast.error('Error al actualizar el nivel'),
  })
}

export function useRevocarPrestador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (prestadorId: number) => revocarPrestador(prestadorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] })
      toast.success('Acceso revocado')
    },
    onError: () => toast.error('Error al revocar acceso'),
  })
}

export function useRevocarRubro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ prestadorId, rubro }: { prestadorId: number; rubro: string }) =>
      revocarRubro(prestadorId, rubro),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] })
      toast.success('Rubro revocado')
    },
    onError: () => toast.error('Error al revocar rubro'),
  })
}
