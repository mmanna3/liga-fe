import type { EquipoDeLaZonaDTO, TorneoFechaDTO } from '@/api/clients'
import { useState } from 'react'
import { FechaCard } from '../fecha-card'
import { NuevaFechaCard } from '../nueva-fecha-card'

export function FechasZona({
  fechas,
  equipos,
  zonaId
}: {
  fechas: TorneoFechaDTO[]
  equipos: EquipoDeLaZonaDTO[]
  zonaId: number
}) {
  const [agregando, setAgregando] = useState(false)
  const fechasOrdenadas = [...fechas].sort((a, b) => a.numero - b.numero)
  const nextNumero =
    fechasOrdenadas.length > 0
      ? fechasOrdenadas[fechasOrdenadas.length - 1].numero + 1
      : 1

  return (
    <div>
      {/* Encabezado con botón agregar */}
      <div className='flex justify-end mb-3'>
        <button
          className='text-sm text-foreground hover:underline border border-border bg-background rounded-md px-3 py-1.5'
          onClick={() => setAgregando(true)}
          disabled={agregando}
        >
          Agregar fecha +
        </button>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {fechasOrdenadas.map((f) => (
          <FechaCard
            key={f.id ?? f.numero}
            fecha={f}
            equipos={equipos}
            zonaId={zonaId}
          />
        ))}

        {agregando && (
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
