import { apiClient } from './api-client'
import type { DocumentoMetadata } from '../types/documento'

export interface ClienteConNivel {
  productorId: number
  razonSocial: string
  email: string
  rubros: string[]
  nivelPermiso: 'READ' | 'WRITE' | 'DELETE'
}

export async function listMisClientes(): Promise<ClienteConNivel[]> {
  const response = await apiClient.get<ClienteConNivel[]>('/api/v1/autorizaciones/mis-productores')
  return response.data
}

export async function listDocumentosDeCliente(clienteId: number): Promise<DocumentoMetadata[]> {
  const response = await apiClient.get<DocumentoMetadata[]>('/api/v1/documentos')
  return response.data.filter((d) => d.usuarioOwnerId === clienteId)
}
