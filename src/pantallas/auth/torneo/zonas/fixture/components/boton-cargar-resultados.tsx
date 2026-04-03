import type { JornadaDTO } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'

/** True si el primer partido de la jornada tiene resultado local distinto de vacío. */
export function jornadaTieneResultadosCargados(j: JornadaDTO): boolean {
  const rl = j.partidos?.[0]?.resultadoLocal
  return rl != null && String(rl).trim() !== ''
}

export function BotonCargarResultados({
  jornada,
  onCargarResultadosClick
}: {
  jornada: JornadaDTO
  onCargarResultadosClick: (jornada: JornadaDTO) => void
}) {
  const tieneResultados = jornadaTieneResultadosCargados(jornada)
  const tooltipPelota = !tieneResultados
    ? 'No hay resultados cargados ✘'
    : !jornada.resultadosVerificados
      ? 'Resultados cargados sin verificar ⚠'
      : 'Resultados verificados ✔'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          data-testid='btn-carga-resultados-jornada'
          className={cn(
            'h-7 w-7 shrink-0',
            !tieneResultados && 'text-muted-foreground hover:text-foreground',
            tieneResultados &&
              !jornada.resultadosVerificados &&
              'text-yellow-500 hover:text-yellow-600',
            tieneResultados &&
              jornada.resultadosVerificados &&
              'text-green-600 hover:text-green-600'
          )}
          aria-label={tooltipPelota}
          onClick={() => onCargarResultadosClick(jornada)}
        >
          <Icono nombre='Pelota' className='size-5' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        <p>{tooltipPelota}</p>
      </TooltipContent>
    </Tooltip>
  )
}
