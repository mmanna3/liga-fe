import { type TorneoCategoriaDTO, type ZonaDeFaseDTO } from '@/api/clients'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { MessageSquareMore } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalZonaLeyendas from './modal-zona-leyendas'

interface DatosFaseLecturaProps {
  formato: string
  zonas: ZonaDeFaseDTO[]
  torneoId?: number
  faseId?: number
  nombreTorneo?: string
  nombreFase?: string
  categorias?: TorneoCategoriaDTO[]
}

function ZonaItem({
  zona,
  torneoId,
  faseId,
  nombreTorneo,
  nombreFase,
  tipoDeFase,
  categorias
}: {
  zona: ZonaDeFaseDTO
  torneoId?: number
  faseId?: number
  nombreTorneo?: string
  nombreFase?: string
  tipoDeFase: string
  categorias: TorneoCategoriaDTO[]
}) {
  const navigate = useNavigate()
  const [modalLeyendasAbierto, setModalLeyendasAbierto] = useState(false)
  const nombre = zona.nombre ?? '—'
  const nEquipos = zona.cantidadDeEquipos ?? 0
  const subtitulo = nEquipos === 1 ? '1 equipo' : `${nEquipos} equipos`
  const pathFixture =
    zona.id != null && torneoId != null && faseId != null && faseId > 0
      ? `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas/${zona.id}/fixture`
      : null

  const puedeAccionesZona =
    zona.id != null && torneoId != null && faseId != null && faseId > 0

  return (
    <li className='flex gap-3 items-center rounded-md border border-border bg-muted/30 px-3 py-2'>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium text-sm'>{nombre}</p>
        <p className='text-muted-foreground text-xs'>{subtitulo}</p>
      </div>
      {puedeAccionesZona && (
        <>
          <div className='flex shrink-0 items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Boton
                  type='button'
                  variant='outline'
                  className='h-5 w-5 min-w-5 shrink-0 border-none bg-transparent p-0 shadow-none'
                  aria-label='Leyendas de la zona'
                  onClick={() => setModalLeyendasAbierto(true)}
                >
                  <MessageSquareMore className='h-4 w-4 shrink-0' />
                </Boton>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='max-w-xs px-4 py-3'
                sideOffset={8}
              >
                <p>Leyendas de la zona</p>
              </TooltipContent>
            </Tooltip>
            {pathFixture && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Boton
                    type='button'
                    variant='outline'
                    className='h-5 w-5 min-w-5 shrink-0 border-none bg-transparent p-0 shadow-none'
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
          </div>
          <ModalZonaLeyendas
            open={modalLeyendasAbierto}
            onOpenChange={setModalLeyendasAbierto}
            faseId={faseId!}
            zonaId={zona.id!}
            nombreTorneo={nombreTorneo ?? '—'}
            nombreFase={nombreFase ?? '—'}
            tipoDeFase={tipoDeFase}
            nombreZona={nombre}
            categorias={categorias}
          />
        </>
      )}
    </li>
  )
}

export function DatosFaseLectura({
  formato,
  zonas,
  torneoId,
  faseId,
  nombreTorneo,
  nombreFase,
  categorias = []
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
                nombreTorneo={nombreTorneo}
                nombreFase={nombreFase}
                tipoDeFase={formato || '—'}
                categorias={categorias}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
