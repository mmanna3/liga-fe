import { ZonaDeFaseDTO } from '@/api/clients'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'

interface DatosFaseLecturaProps {
  formato: string
  zonas: ZonaDeFaseDTO[]
  torneoId?: number
  faseId?: number
}

function ZonaItem({
  zona,
  torneoId,
  faseId
}: {
  zona: ZonaDeFaseDTO
  torneoId?: number
  faseId?: number
}) {
  const navigate = useNavigate()
  const nombre = zona.nombre ?? '—'
  const nEquipos = zona.cantidadDeEquipos ?? 0
  const subtitulo = nEquipos === 1 ? '1 equipo' : `${nEquipos} equipos`
  const pathFixture =
    zona.id != null && torneoId != null && faseId != null && faseId > 0
      ? `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas/${zona.id}/fixture`
      : null

  return (
    <li className='flex gap-3 items-center rounded-md border border-border bg-muted/30 px-3 py-2'>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium text-sm'>{nombre}</p>
        <p className='text-muted-foreground text-xs'>{subtitulo}</p>
      </div>
      {pathFixture && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Boton
              type='button'
              variant='outline'
              className='h-8 w-8 min-w-8 shrink-0 p-0'
              aria-label='Fixture de la zona'
              onClick={() => navigate(pathFixture)}
            >
              <Icono nombre='Fixture' className='h-4 w-4 shrink-0' />
            </Boton>
          </TooltipTrigger>
          <TooltipContent
            side='bottom'
            className='max-w-xs px-4 py-3'
            sideOffset={8}
          >
            <p>Fixture de la zona</p>
          </TooltipContent>
        </Tooltip>
      )}
    </li>
  )
}

export function DatosFaseLectura({
  formato,
  zonas,
  torneoId,
  faseId
}: DatosFaseLecturaProps) {
  return (
    <div className='mt-3'>
      <div>
        <p className='font-medium text-muted-foreground text-xs'>
          {formato || '—'}
        </p>
      </div>
      {zonas != null && zonas.length > 0 && (
        <div>
          {/* <Label className='text-muted-foreground text-sm'>Zonas</Label> */}
          <ul className='grid grid-cols-2 gap-1.5 mt-2'>
            {zonas.map((zona) => (
              <ZonaItem
                key={zona.id ?? zona.nombre}
                zona={zona}
                torneoId={torneoId}
                faseId={faseId}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
