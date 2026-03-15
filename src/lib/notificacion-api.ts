import { apiClient } from './api-client'

export interface NotificacionDTO {
  id: number
  tipo: string
  mensaje: string
  leida: boolean
  documentoId: number | null
  createdAt: string
}

export async function listNotificaciones(): Promise<NotificacionDTO[]> {
  const response = await apiClient.get<NotificacionDTO[]>('/api/v1/notificaciones')
  return response.data
}

export async function marcarLeida(id: number): Promise<void> {
  await apiClient.put(`/api/v1/notificaciones/${id}/leer`)
}

export async function marcarTodasLeidas(): Promise<void> {
  await apiClient.put('/api/v1/notificaciones/leer-todas')
}
