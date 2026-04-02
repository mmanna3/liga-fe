import type { EquipoDeLaZonaDTO, FechaDTO } from '@/api/clients'
import { useState } from 'react'
import { NuevaFechaCard } from '../nueva-fecha-card'
import { FechaCard } from './fecha-card'

function ordenarFechas(a: FechaDTO, b: FechaDTO): number {
  const aEd = a.instanciaId != null
  const bEd = b.instanciaId != null
  if (aEd && bEd) {
    return (
      (a.instanciaId ?? 0) - (b.instanciaId ?? 0) || (a.id ?? 0) - (b.id ?? 0)
    )
  }
  return a.numero - b.numero
}

export function FechasZona({
  fechas,
  equipos,
  zonaId,
  esEliminacionDirecta = false
}: {
  fechas: FechaDTO[]
  equipos: EquipoDeLaZonaDTO[]
  zonaId: number
  /** Fase de eliminación directa: las fechas se crean por instancia, no con "Agregar fecha". */
  esEliminacionDirecta?: boolean
}) {
  const [agregando, setAgregando] = useState(false)
  const fechasOrdenadas = [...fechas].sort(ordenarFechas)
  const puedeAgregarFechaManual = !esEliminacionDirecta
  const nextNumero =
    fechasOrdenadas.length > 0
      ? fechasOrdenadas[fechasOrdenadas.length - 1].numero + 1
      : 1

  return (
    <div>
      {/* Encabezado con botón agregar */}
      {puedeAgregarFechaManual && (
        <div className='flex justify-end mb-3'>
          <button
            className='text-sm text-foreground hover:underline border border-border bg-background rounded-md px-3 py-1.5'
            onClick={() => setAgregando(true)}
            disabled={agregando}
          >
            Agregar fecha +
          </button>
        </div>
      )}

      <div className='grid grid-cols-3 gap-4'>
        {fechasOrdenadas.map((f) => (
          <FechaCard
            key={f.id ?? `${f.numero}-${f.instanciaId ?? 0}`}
            fecha={f}
            equipos={equipos}
            zonaId={zonaId}
          />
        ))}

        {puedeAgregarFechaManual && agregando && (
          <NuevaFechaCard
            nextNumero={nextNumero}
            equipos={equipos}
            zonaId={zonaId}
            onCancelar={() => setAgregando(false)}
          />
        )}
      </div>
    </div>
  )
}
