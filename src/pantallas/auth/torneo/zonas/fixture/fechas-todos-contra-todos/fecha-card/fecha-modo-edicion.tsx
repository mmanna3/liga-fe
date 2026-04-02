import type { EquipoDeLaZonaDTO } from '@/api/clients'
import { Calendario } from '@/design-system/ykn-ui/calendario'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  JornadaFilaEdicion,
  type CampoReemplazo,
  type JornadaBorrador
} from '../jornada-edicion'

export interface FechaModoEdicionProps {
  borrador: {
    dia: Date | undefined
    jornadas: JornadaBorrador[]
  }
  setBorrador: React.Dispatch<
    React.SetStateAction<{
      dia: Date | undefined
      jornadas: JornadaBorrador[]
    } | null>
  >
  equipoMap: Map<number, EquipoDeLaZonaDTO>
  onEliminarJornada: (idx: number) => void
  onClickEquipo: (
    jornadaIdx: number,
    campo: CampoReemplazo,
    nombreActual: string
  ) => void
  onAbrirModalAgregar: () => void
  onCancelar: () => void
  onGuardar: () => void
  estaCargandoGuardar: boolean
}

export function FechaModoEdicion({
  borrador,
  setBorrador,
  equipoMap,
  onEliminarJornada,
  onClickEquipo,
  onAbrirModalAgregar,
  onCancelar,
  onGuardar,
  estaCargandoGuardar
}: FechaModoEdicionProps) {
  const setDia = (dia: Date | undefined) =>
    setBorrador((p) => (p ? { ...p, dia } : p))

  return (
    <>
      <div className='mb-3'>
        <Calendario selected={borrador.dia} onSelect={(dia) => setDia(dia)} />
      </div>

      <div className='grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground mb-1'>
        <span className='text-right'>LOCAL</span>
        <span className='text-left'>VISITANTE</span>
        <span />
      </div>

      <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
        {borrador.jornadas.map((j, i) => (
          <JornadaFilaEdicion
            key={i}
            j={j}
            jornadaIdx={i}
            equipoMap={equipoMap}
            onClickEquipo={onClickEquipo}
            onEliminar={() => onEliminarJornada(i)}
          />
        ))}
      </div>

      <button
        className='mt-2 text-sm text-primary hover:underline'
        onClick={onAbrirModalAgregar}
      >
        Agregar jornada +
      </button>

      <div className='flex gap-2 justify-end mt-4 pt-3 border-t'>
        <Boton variant='outline' onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton estaCargando={estaCargandoGuardar} onClick={onGuardar}>
          Guardar
        </Boton>
      </div>
    </>
  )
}
