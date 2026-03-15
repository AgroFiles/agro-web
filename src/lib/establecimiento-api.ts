import { apiClient } from './api-client'
import type { Establecimiento } from '../types/establecimiento'

export async function listEstablecimientos(): Promise<Establecimiento[]> {
  const response = await apiClient.get<Establecimiento[]>('/api/v1/establecimientos')
  return response.data
}

export async function listEstablecimientosDeCliente(propietarioId: number): Promise<Establecimiento[]> {
  const response = await apiClient.get<Establecimiento[]>(`/api/v1/establecimientos?propietarioId=${propietarioId}`)
  return response.data
}

export async function createEstablecimiento(nombre: string): Promise<Establecimiento> {
  const response = await apiClient.post<Establecimiento>('/api/v1/establecimientos', { nombre })
  return response.data
}

export async function deleteEstablecimiento(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/establecimientos/${id}`)
}

export async function compartirAccesoEstablecimiento(
  establecimientoId: number,
  usuarioId: number
): Promise<void> {
  await apiClient.post(`/api/v1/establecimientos/${establecimientoId}/compartir`, { usuarioId })
}

export async function revocarAccesoEstablecimiento(
  establecimientoId: number,
  usuarioId: number
): Promise<void> {
  await apiClient.delete(`/api/v1/establecimientos/${establecimientoId}/compartir/${usuarioId}`)
}
