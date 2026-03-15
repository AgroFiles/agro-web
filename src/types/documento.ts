export interface DocumentoMetadata {
  id: number
  blobName: string
  containerName: string
  blobUrl: string
  originalFileName: string
  mimeType: string
  fileSizeBytes: number
  md5Hash: string | null
  scanStatus: string
  hasThumbnail: boolean
  usuarioOwnerId: number
  establecimientoId: number | null
  cargadoPorUsuarioId: number | null
  tipoDocumento: string
  rubros: string[]
  estado: number
  createdAt: string
  updatedAt: string
}

export const TIPOS_DOCUMENTO = [
  'ROMANEO',
  'DTE',
  'CERTIFICADO_SANITARIO',
  'GUIA_TRANSPORTE',
  'ANALISIS_LABORATORIO',
  'FACTURA',
  'REMITO',
  'OTRO',
] as const

export type TipoDocumento = typeof TIPOS_DOCUMENTO[number]

export const TIPOS_DOCUMENTO_LABELS: Record<string, string> = {
  ROMANEO: 'Romaneo',
  DTE: 'DTE',
  CERTIFICADO_SANITARIO: 'Certificado Sanitario',
  GUIA_TRANSPORTE: 'Guía de Transporte',
  ANALISIS_LABORATORIO: 'Análisis de Laboratorio',
  FACTURA: 'Factura',
  REMITO: 'Remito',
  OTRO: 'Otro',
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface DocumentoUploadOptions {
  file: File
  tipoDocumento?: string
  establecimientoId?: number
  rubros?: string[]
  onProgress?: (progress: UploadProgress) => void
}

export interface DocumentoDownloadOptions {
  documentoId: number
  fileName: string
}
