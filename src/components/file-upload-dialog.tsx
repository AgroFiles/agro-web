import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { X, Upload, FileIcon, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { useUploadFile } from '../hooks/use-files'
import { formatFileSize } from '../lib/file-api'
import { TIPOS_DOCUMENTO, TIPOS_DOCUMENTO_LABELS } from '../types/documento'
import type { UploadProgress } from '../types/documento'
import type { Establecimiento } from '../types/establecimiento'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const RUBROS_DISPONIBLES = [
  { value: 'GANADERIA', label: 'Ganadería' },
  { value: 'AGRICULTURA', label: 'Agricultura' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'FAENA', label: 'Faena' },
  { value: 'VETERINARIA', label: 'Veterinaria' },
  { value: 'LABORATORIO', label: 'Laboratorio' },
]

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  establecimientos?: Establecimiento[]
}

export function FileUploadDialog({
  open,
  onOpenChange,
  establecimientos = [],
}: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<string>('OTRO')
  const [establecimientoId, setEstablecimientoId] = useState<string>('')
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useUploadFile()

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo es demasiado grande. Máximo: ${formatFileSize(MAX_FILE_SIZE)}`
    }
    return null
  }

  const handleFile = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setValidationError(error)
      setSelectedFile(null)
      return
    }
    setValidationError(null)
    setSelectedFile(file)
    setUploadProgress(null)
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const toggleRubro = (rubro: string) => {
    setRubrosSeleccionados((prev) =>
      prev.includes(rubro) ? prev.filter((r) => r !== rubro) : [...prev, rubro]
    )
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        tipoDocumento,
        establecimientoId: establecimientoId ? Number(establecimientoId) : undefined,
        rubros: rubrosSeleccionados,
        onProgress: (p) => setUploadProgress(p),
      })
      reset()
      onOpenChange(false)
    } catch {
      setUploadProgress(null)
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setUploadProgress(null)
    setValidationError(null)
    setTipoDocumento('OTRO')
    setEstablecimientoId('')
    setRubrosSeleccionados([])
  }

  const handleCancel = () => {
    if (!uploadMutation.isPending) {
      reset()
      onOpenChange(false)
    }
  }

  if (!open) return null

  const isUploading = uploadMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto bg-white shadow-xl">
        <button
          onClick={handleCancel}
          disabled={isUploading}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-semibold">Subir Documento</h2>
          <p className="text-sm text-gray-500 mt-1">Arrastra un archivo o haz clic para seleccionar</p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 ${
            dragActive ? 'border-blue-500 bg-blue-50' :
            validationError ? 'border-red-300 bg-red-50' :
            'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            disabled={isUploading}
          />
          {!selectedFile ? (
            <>
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-3 text-sm text-gray-600">
                Arrastra aquí o{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:underline"
                  disabled={isUploading}
                >
                  selecciona un archivo
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-400">Máximo {formatFileSize(MAX_FILE_SIZE)}</p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <FileIcon className="h-7 w-7 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {validationError && (
          <p className="text-sm text-red-600 mb-4">{validationError}</p>
        )}

        {/* Metadata fields */}
        <div className="space-y-4">
          {/* Tipo documento */}
          <div className="space-y-1.5">
            <Label>Tipo de documento</Label>
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              disabled={isUploading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t} value={t}>{TIPOS_DOCUMENTO_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Establecimiento */}
          {establecimientos.length > 0 && (
            <div className="space-y-1.5">
              <Label>Establecimiento (opcional)</Label>
              <select
                value={establecimientoId}
                onChange={(e) => setEstablecimientoId(e.target.value)}
                disabled={isUploading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sin establecimiento</option>
                {establecimientos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rubros */}
          <div className="space-y-1.5">
            <Label>Rubros (opcional)</Label>
            <p className="text-xs text-gray-500">Permite que prestadores de estos rubros accedan al documento</p>
            <div className="flex flex-wrap gap-2">
              {RUBROS_DISPONIBLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleRubro(value)}
                  disabled={isUploading}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    rubrosSeleccionados.includes(value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        {uploadProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Subiendo...</span>
              <span className="font-medium">{uploadProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button onClick={handleCancel} variant="outline" className="flex-1" disabled={isUploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            className="flex-1"
            disabled={!selectedFile || !!validationError || isUploading}
          >
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Subir</>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
