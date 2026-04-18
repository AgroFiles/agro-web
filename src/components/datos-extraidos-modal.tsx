import { X } from 'lucide-react'
import type { DocumentoMetadata, RomaneoRow } from '@/types/documento'

interface Props {
  doc: DocumentoMetadata
  onClose: () => void
}

function RomaneoTable({ rows }: { rows: RomaneoRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-xs uppercase tracking-wide">
            <th className="px-4 py-2 text-left font-semibold border-b border-blue-100">Garrón</th>
            <th className="px-4 py-2 text-left font-semibold border-b border-blue-100">Clasif.</th>
            <th className="px-4 py-2 text-left font-semibold border-b border-blue-100">Tipo</th>
            <th className="px-4 py-2 text-left font-semibold border-b border-blue-100">Destino</th>
            <th className="px-4 py-2 text-right font-semibold border-b border-blue-100">Dientes</th>
            <th className="px-4 py-2 text-right font-semibold border-b border-blue-100">Peso MR1</th>
            <th className="px-4 py-2 text-right font-semibold border-b border-blue-100">Peso MR2</th>
            <th className="px-4 py-2 text-right font-semibold border-b border-blue-100">Decomiso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              <td className="px-4 py-2 text-gray-800 font-medium">{row.garron_id}</td>
              <td className="px-4 py-2 text-gray-700">{row.clasificacion}</td>
              <td className="px-4 py-2 text-gray-700">{row.tipo}</td>
              <td className="px-4 py-2 text-gray-700">{row.destino}</td>
              <td className="px-4 py-2 text-right text-gray-700">{row.dientes}</td>
              <td className="px-4 py-2 text-right text-gray-800">{row.peso_mr_1 ?? '—'}</td>
              <td className="px-4 py-2 text-right text-gray-800">{row.peso_mr_2 ?? '—'}</td>
              <td className="px-4 py-2 text-right text-gray-700">{row.decomiso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DatosExtraídosModal({ doc, onClose }: Props) {
  const datos = doc.datosExtraidos
  const rows = Array.isArray(datos?.data) ? datos.data : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Datos extraídos</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-lg">{doc.originalFileName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
              {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {rows.length > 0 ? (
            doc.tipoDocumento === 'ROMANEO' ? (
              <RomaneoTable rows={rows as any} />
            ) : (
              <pre className="p-6 text-xs text-gray-700 font-mono whitespace-pre-wrap">
                {JSON.stringify(datos, null, 2)}
              </pre>
            )
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No hay datos extraídos para este documento
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
