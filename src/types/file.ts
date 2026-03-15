export interface FileMetadata {
  id: number
  blobName: string
  containerName: string
  blobUrl: string
  originalFileName: string
  mimeType: string
  fileSizeBytes: number
  md5Hash: string | null
  scanStatus: string
  scanDate: string | null
  hasThumbnail: boolean
  thumbnailBlobName: string | null
  thumbnailUrl: string | null
  ownerId: number
  readerIds: number[]
  writerIds: number[]
  estado: number
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type FileUploadState = 'idle' | 'uploading' | 'success' | 'error'

export interface FileUploadOptions {
  file: File
  readerIds?: number[]
  writerIds?: number[]
  onProgress?: (progress: UploadProgress) => void
}

export interface FileDownloadOptions {
  fileId: number
  fileName: string
}
