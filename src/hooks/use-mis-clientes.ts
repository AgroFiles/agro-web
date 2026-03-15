import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listMisClientes, listDocumentosDeCliente } from '@/lib/cliente-api'
import { uploadFileParaCliente } from '@/lib/file-api'
import type { ClienteUploadOptions } from '@/lib/file-api'

export function useMisClientes() {
  return useQuery({
    queryKey: ['mis-clientes'],
    queryFn: listMisClientes,
  })
}

export function useDocumentosDeCliente(clienteId: number | null) {
  return useQuery({
    queryKey: ['documentos-cliente', clienteId],
    queryFn: () => listDocumentosDeCliente(clienteId!),
    enabled: clienteId !== null,
  })
}

export function useUploadParaCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (opts: ClienteUploadOptions) => uploadFileParaCliente(opts),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['documentos-cliente', vars.propietarioId] })
      toast.success('Documento subido correctamente al repositorio del cliente')
    },
    onError: () => {
      toast.error('Error al subir el documento')
    },
  })
}
