import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listNotificaciones, marcarLeida, marcarTodasLeidas } from '@/lib/notificacion-api'

export function useNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones'],
    queryFn: listNotificaciones,
    refetchInterval: 30_000, // poll every 30s
    staleTime: 25_000,
  })
}

export function useMarcarLeida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marcarLeida,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  })
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  })
}
