import { useState, useRef, useCallback } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Label } from './ui/label'
import { uploadFile } from '../lib/file-api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatFileSize } from '../lib/file-api'
import { TIPOS_DOCUMENTO, TIPOS_DOCUMENTO_LABELS } from '../types/documento'
import type { Establecimiento } from '../types/establecimiento'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png'

const RUBROS_DISPONIBLES = [
  { value: 'GANADERIA',   label: 'Ganadería'   },
  { value: 'AGRICULTURA', label: 'Agricultura'  },
  { value: 'TRANSPORTE',  label: 'Transporte'   },
  { value: 'FAENA',       label: 'Faena'        },
  { value: 'VETERINARIA', label: 'Veterinaria'  },
  { value: 'LABORATORIO', label: 'Laboratorio'  },
]

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

interface QueuedFile {
  id: string
  file: File
  status: FileStatus
  progress: number
  error?: string
}

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  establecimientos?: Establecimiento[]
}

function fileId() {
  return Math.random().toString(36).slice(2)
}

export function FileUploadDialog({
  open,
  onOpenChange,
  establecimientos = [],
}: FileUploadDialogProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<string>('OTRO')
  const [establecimientoId, setEstablecimientoId] = useState<string>('')
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueuedFile[] = []
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" supera el límite de ${formatFileSize(MAX_FILE_SIZE)}`)
        continue
      }
      newItems.push({ id: fileId(), file, status: 'pending', progress: 0 })
    }
    if (newItems.length > 0) setQueue((prev) => [...prev, ...newItems])
  }, [])

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else setDragActive(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeFile = (id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id))
  }

  const toggleRubro = (rubro: string) => {
    setRubrosSeleccionados((prev) =>
      prev.includes(rubro) ? prev.filter((r) => r !== rubro) : [...prev, rubro]
    )
  }

  const updateFile = (id: string, patch: Partial<QueuedFile>) =>
    setQueue((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const handleUpload = async () => {
    const pending = queue.filter((f) => f.status === 'pending')
    if (pending.length === 0) return
    setUploading(true)

    await Promise.all(
      pending.map(async ({ id, file }) => {
        updateFile(id, { status: 'uploading', progress: 0 })
        try {
          await uploadFile({
            file,
            tipoDocumento,
            establecimientoId: establecimientoId ? Number(establecimientoId) : undefined,
            rubros: rubrosSeleccionados,
            onProgress: (p) => updateFile(id, { progress: p.percentage }),
          })
          updateFile(id, { status: 'done', progress: 100 })
        } catch {
          updateFile(id, { status: 'error', error: 'Error al subir' })
        }
      })
    )

    queryClient.invalidateQueries({ queryKey: ['files'] })
    setUploading(false)

    const final = queue.filter((f) => f.status !== 'error')
    const errors = queue.filter((f) => f.status === 'error')

    if (errors.length === 0) {
      toast.success(
        pending.length === 1
          ? 'Documento subido correctamente'
          : `${pending.length} documentos subidos correctamente`
      )
      reset()
      onOpenChange(false)
    } else {
      toast.error(`${errors.length} archivo${errors.length !== 1 ? 's' : ''} no se pudo${errors.length !== 1 ? 'ron' : ''} subir`)
      // Keep failed files in queue so user can retry
      setQueue((prev) => prev.filter((f) => f.status === 'error').map((f) => ({ ...f, status: 'pending', progress: 0 })))
      if (final.length > 0) toast.success(`${final.length} archivo${final.length !== 1 ? 's' : ''} subido${final.length !== 1 ? 's' : ''} correctamente`)
    }
  }

  const reset = () => {
    setQueue([])
    setTipoDocumento('OTRO')
    setEstablecimientoId('')
    setRubrosSeleccionados([])
  }

  const handleClose = () => {
    if (!uploading) {
      reset()
      onOpenChange(false)
    }
  }

  if (!open) return null

  const pendingCount = queue.filter((f) => f.status === 'pending').length
  const allDone = queue.length > 0 && queue.every((f) => f.status === 'done')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto bg-white shadow-xl">
        <button
          onClick={handleClose}
          disabled={uploading}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-semibold">Subir Documentos</h2>
          <p className="text-sm text-gray-500 mt-1">Arrastrá uno o varios archivos, o hacé clic para seleccionar</p>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4 cursor-pointer ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept={ACCEPTED_TYPES}
            onChange={handleChange}
            disabled={uploading}
          />
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Arrastrá archivos aquí o{' '}
            <span className="text-blue-600 hover:underline">seleccioná desde tu equipo</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            PDF, JPG o PNG · Máx. {formatFileSize(MAX_FILE_SIZE)} por archivo
          </p>
        </div>

        {/* File queue */}
        {queue.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500">
                {queue.length} archivo{queue.length !== 1 ? 's' : ''} seleccionado{queue.length !== 1 ? 's' : ''}
              </span>
              {!uploading && pendingCount > 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Agregar más
                </button>
              )}
            </div>
            {queue.map(({ id, file, status, progress, error }) => (
              <div
                key={id}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
              >
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  {status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
                </div>
                {status === 'pending' && !uploading && (
                  <button onClick={() => removeFile(id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {status === 'uploading' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
                )}
                {status === 'done' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Metadata — shared for all files */}
        {queue.length > 0 && !allDone && (
          <div className="space-y-4">
            {queue.length > 1 && (
              <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                Los metadatos (tipo, establecimiento, rubros) se aplicarán a todos los archivos.
              </p>
            )}

            <div className="space-y-1.5">
              <Label>Tipo de documento</Label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                disabled={uploading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>{TIPOS_DOCUMENTO_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {establecimientos.length > 0 && (
              <div className="space-y-1.5">
                <Label>Establecimiento (opcional)</Label>
                <select
                  value={establecimientoId}
                  onChange={(e) => setEstablecimientoId(e.target.value)}
                  disabled={uploading}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sin establecimiento</option>
                  {establecimientos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Rubros (opcional)</Label>
              <p className="text-xs text-gray-500">Permite que prestadores de estos rubros accedan al documento</p>
              <div className="flex flex-wrap gap-2">
                {RUBROS_DISPONIBLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRubro(value)}
                    disabled={uploading}
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
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button onClick={handleClose} variant="outline" className="flex-1" disabled={uploading}>
            {allDone ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!allDone && (
            <Button
              onClick={handleUpload}
              className="flex-1"
              disabled={pendingCount === 0 || uploading}
            >
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" />
                  {pendingCount > 1 ? `Subir ${pendingCount} archivos` : 'Subir'}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
