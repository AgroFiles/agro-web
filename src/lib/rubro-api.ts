import { apiClient } from './api-client'
import type { Rubro } from '../types/establecimiento'

export async function listRubros(): Promise<Rubro[]> {
  const response = await apiClient.get<Rubro[]>('/api/v1/rubros')
  return response.data
}

export async function getMisRubros(usuarioId: number): Promise<string[]> {
  const response = await apiClient.get<string[]>(`/api/v1/usuarios/${usuarioId}/rubros`)
  return response.data
}

export async function asignarRubro(usuarioId: number, rubro: string): Promise<void> {
  await apiClient.post(`/api/v1/usuarios/${usuarioId}/rubros`, { rubro })
}

export async function removerRubro(usuarioId: number, rubro: string): Promise<void> {
  await apiClient.delete(`/api/v1/usuarios/${usuarioId}/rubros/${rubro}`)
}
