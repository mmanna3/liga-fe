import type {
  ArbitroElegibleAsignacionDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { AlertTriangle } from 'lucide-react'
import {
  mismaFechaCalendario,
  nombreCompletoArbitro
} from './utilidades-asignacion'

interface SelectorArbitroJornadaProps {
  titulo: string
  jornada: JornadaAsignacionDTO
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  valor: string
  otroSlotArbitroId: string
  deshabilitado?: boolean
  alCambiar: (arbitroId: string) => void
}

function obtenerConflicto(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): string | null {
  const asignaciones = arbitro.jornadasAsignadasEnProximasFechas ?? []
  const conflicto = asignaciones.find(
    (j) =>
      j.jornadaId !== jornada.id &&
      j.dia &&
      mismaFechaCalendario(new Date(j.dia), jornada.dia)
  )
  if (!conflicto) return null
  return `${conflicto.torneoNombre} · ${conflicto.local} vs ${conflicto.visitante}`
}

export default function SelectorArbitroJornada({
  titulo,
  jornada,
  arbitrosElegibles,
  valor,
  otroSlotArbitroId,
  deshabilitado,
  alCambiar
}: SelectorArbitroJornadaProps) {
  const opciones = [
    { value: 'sin-arbitro', label: 'Sin árbitro' },
    ...arbitrosElegibles
      .filter((a) => String(a.id) !== otroSlotArbitroId)
      .map((a) => {
        const conflicto = obtenerConflicto(a, jornada)
        const nombre = nombreCompletoArbitro(a.nombre, a.apellido)
        return {
          value: String(a.id),
          label: conflicto ? `${nombre} ⚠` : nombre,
          conflicto
        }
      })
  ]

  const arbitroSeleccionado = arbitrosElegibles.find(
    (a) => String(a.id) === valor
  )
  const textoConflicto =
    arbitroSeleccionado && valor !== 'sin-arbitro'
      ? obtenerConflicto(arbitroSeleccionado, jornada)
      : null

  return (
    <div className='min-w-[180px] flex-1 space-y-1'>
      <ListaDesplegable
        titulo={titulo}
        opciones={opciones.map(({ value, label }) => ({ value, label }))}
        valor={valor}
        alCambiar={alCambiar}
        deshabilitado={deshabilitado}
        triggerClassName={
          textoConflicto ? 'border-amber-500/60 bg-amber-50/50' : undefined
        }
      />
      {textoConflicto && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className='flex items-center gap-1 text-xs text-amber-700'>
                <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                Ya tiene jornada ese día
              </p>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='max-w-xs'>
              {textoConflicto}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
