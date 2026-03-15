import { apiClient } from './api-client'

export interface AutorizacionDTO {
  prestadorId: number
  razonSocial: string
  email: string
  rubros: string[]
  nivelPermiso: 'READ' | 'WRITE' | 'DELETE'
}

export interface ProductorAutorizanteDTO {
  productorId: number
  razonSocial: string
  email: string
  rubros: string[]
}

export async function listAutorizaciones(): Promise<AutorizacionDTO[]> {
  const response = await apiClient.get<AutorizacionDTO[]>('/api/v1/autorizaciones')
  return response.data
}

export async function autorizarPrestador(
  prestadorId: number,
  rubros: string[],
  nivelPermiso: string = 'READ'
): Promise<AutorizacionDTO[]> {
  const response = await apiClient.post<AutorizacionDTO[]>('/api/v1/autorizaciones', {
    prestadorId,
    rubros,
    nivelPermiso,
  })
  return response.data
}

export async function actualizarNivelPrestador(
  prestadorId: number,
  nivelPermiso: string
): Promise<void> {
  await apiClient.put(`/api/v1/autorizaciones/${prestadorId}/nivel`, { nivelPermiso })
}

export async function revocarPrestador(prestadorId: number): Promise<void> {
  await apiClient.delete(`/api/v1/autorizaciones/${prestadorId}`)
}

export async function revocarRubro(prestadorId: number, rubro: string): Promise<void> {
  await apiClient.delete(`/api/v1/autorizaciones/${prestadorId}/rubros/${rubro}`)
}

export async function listMisProductores(): Promise<ProductorAutorizanteDTO[]> {
  const response = await apiClient.get<ProductorAutorizanteDTO[]>('/api/v1/autorizaciones/mis-productores')
  return response.data
}
