import type {
  ArbitroElegibleAsignacionDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { formatearDiaCorto } from './utilidades-asignacion'
import SelectorArbitroJornada from './selector-arbitro-jornada'

interface FilaJornadaAsignacionProps {
  jornada: JornadaAsignacionDTO
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  arbitro1Id: string
  arbitro2Id: string
  guardando: boolean
  alCambiarArbitro1: (arbitroId: string) => void
  alCambiarArbitro2: (arbitroId: string) => void
}

export default function FilaJornadaAsignacion({
  jornada,
  arbitrosElegibles,
  arbitro1Id,
  arbitro2Id,
  guardando,
  alCambiarArbitro1,
  alCambiarArbitro2
}: FilaJornadaAsignacionProps) {
  return (
    <div className='flex flex-col gap-3 border-b border-border py-4 last:border-b-0 lg:flex-row lg:items-end lg:justify-between'>
      <div className='min-w-0 flex-1 space-y-1'>
        <p className='text-sm font-medium'>
          {jornada.diaSemana} {formatearDiaCorto(jornada.dia)}
        </p>
        <p className='text-base'>
          <span className='font-semibold'>{jornada.local}</span>
          {' vs '}
          <span className='font-semibold'>{jornada.visitante}</span>
        </p>
        {jornada.localidadLocal && (
          <p className='text-sm text-muted-foreground'>
            {jornada.localidadLocal}
          </p>
        )}
      </div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
        <SelectorArbitroJornada
          titulo='Árbitro 1'
          jornada={jornada}
          arbitrosElegibles={arbitrosElegibles}
          valor={arbitro1Id}
          otroSlotArbitroId={arbitro2Id}
          deshabilitado={guardando}
          alCambiar={alCambiarArbitro1}
        />
        <SelectorArbitroJornada
          titulo='Árbitro 2'
          jornada={jornada}
          arbitrosElegibles={arbitrosElegibles}
          valor={arbitro2Id}
          otroSlotArbitroId={arbitro1Id}
          deshabilitado={guardando}
          alCambiar={alCambiarArbitro2}
        />
      </div>
    </div>
  )
}
