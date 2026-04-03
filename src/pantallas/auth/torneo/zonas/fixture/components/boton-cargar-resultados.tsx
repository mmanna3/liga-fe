import type { JornadaDTO } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'

export interface EstadoBotonCargarResultados {
  tooltip: string
  color: string
}

export const ESTADO_BOTON_CARGAR_RESULTADOS = [
  {
    tooltip: 'No hay resultados cargados ✘',
    color: 'text-muted-foreground hover:text-foreground'
  },
  {
    tooltip: 'Resultados cargados sin verificar ⚠',
    color: 'text-yellow-500 hover:text-yellow-600'
  },
  {
    tooltip: 'Resultados verificados ✔',
    color: 'text-green-600 hover:text-green-600'
  }
] as const satisfies readonly EstadoBotonCargarResultados[]

/** True si el primer partido de la jornada tiene resultado local distinto de vacío. */
export function jornadaTieneResultadosCargados(j: JornadaDTO): boolean {
  const rl = j.partidos?.[0]?.resultadoLocal
  return rl != null && String(rl).trim() !== ''
}

export function BotonCargarResultados({
  estado,
  onClick
}: {
  estado: EstadoBotonCargarResultados
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          data-testid='btn-carga-resultados-jornada'
          className={cn('h-7 w-7 shrink-0', estado.color)}
          aria-label={estado.tooltip}
          onClick={onClick}
        >
          <Icono nombre='Pelota' className='size-5' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        <p>{estado.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
