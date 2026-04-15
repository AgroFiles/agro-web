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
  establecimientoNombre?: string
  versionNumero?: number
  documentoRaizId?: number
  ownerRazonSocial?: string
  datosExtraidos?: RomaneoExtraccion | null
}

export interface RomaneoRow {
  id: string
  type: string
  quantity: number
  category: string
  grade: number
  subtype: string
  code1: string
  code2: string
  weight: number
}

export interface RomaneoExtraccion {
  status: number
  data: RomaneoRow[]
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

export type TipoPermiso = 'READ' | 'WRITE' | 'DELETE'

export const TIPO_PERMISO_LABELS: Record<TipoPermiso, string> = {
  READ:   'Lectura',
  WRITE:  'Modificación',
  DELETE: 'Eliminación',
}

export interface PermisoConUsuario {
  usuarioId: number
  razonSocial: string
  email: string
  tipoPermiso: TipoPermiso
  createdAt: string
}
