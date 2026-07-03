import { type FaseCategoriaDTO, type ZonaDeFaseDTO } from '@/api/clients'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { Boton } from '@/design-system/ykn-ui/boton'
import { rutasNavegacion } from '@/ruteo/rutas'
import { MessageSquareMore } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalZonaLeyendas from './modal-zona-leyendas'

/** Orden de listado según `orden` del backend; desempate por id. */
export function zonasDeFaseOrdenadas(zonas: ZonaDeFaseDTO[]): ZonaDeFaseDTO[] {
  return [...zonas].sort((a, b) => {
    const oa = a.orden ?? 0
    const ob = b.orden ?? 0
    if (oa !== ob) return oa - ob
    return (a.id ?? 0) - (b.id ?? 0)
  })
}

interface DatosFaseLecturaProps {
  formato: string
  zonas: ZonaDeFaseDTO[]
  torneoId?: number
  faseId?: number
  nombreTorneo?: string
  nombreFase?: string
  categorias?: FaseCategoriaDTO[]
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
  categorias: FaseCategoriaDTO[]
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

  const irAlFixture = () => {
    if (modalLeyendasAbierto || !pathFixture) return
    navigate(pathFixture)
  }

  return (
    <Fragment>
      <li
        className={`flex gap-3 items-center rounded-md border border-border bg-muted/30 px-3 py-2${
          pathFixture
            ? ' cursor-pointer transition-colors hover:bg-muted/50'
            : ''
        }`}
        onClick={pathFixture ? irAlFixture : undefined}
        onKeyDown={
          pathFixture
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  irAlFixture()
                }
              }
            : undefined
        }
        role={pathFixture ? 'button' : undefined}
        tabIndex={pathFixture ? 0 : undefined}
        aria-label={pathFixture ? `Ir al fixture de ${nombre}` : undefined}
      >
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium text-sm'>{nombre}</p>
          <p className='text-muted-foreground text-xs'>{subtitulo}</p>
        </div>
        {puedeAccionesZona && (
          <>
            <div
              className='flex shrink-0 items-center'
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
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
            </div>
          </>
        )}
      </li>
      {puedeAccionesZona && (
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
      )}
    </Fragment>
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
  const zonasOrdenadas = useMemo(() => zonasDeFaseOrdenadas(zonas), [zonas])

  return (
    <div className='mt-3'>
      <div>
        <p className='font-medium text-muted-foreground text-xs'>
          {formato || '—'}
        </p>
      </div>
      {zonasOrdenadas.length > 0 && (
        <div>
          {/* <Label className='text-muted-foreground text-sm'>Zonas</Label> */}
          <ul className='grid grid-cols-2 gap-1.5 mt-2'>
            {zonasOrdenadas.map((zona) => (
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
