import { apiClient } from './api-client'
import type { User } from '../types/user'
import type { DocumentoMetadata } from '../types/documento'

export async function listMisClientes(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/api/v1/usuarios/mis-clientes')
  return response.data
}

export async function listDocumentosDeCliente(clienteId: number): Promise<DocumentoMetadata[]> {
  const response = await apiClient.get<DocumentoMetadata[]>('/api/v1/documentos')
  return response.data.filter((d) => d.usuarioOwnerId === clienteId)
}
