import type { TorneoDTO, FaseDTO } from '@/api/clients'
import { formatearHorarioDeJuego } from '../detalle-torneo/lib'
import { torneoAElementos } from '../detalle-torneo/components/gestion-fases-torneo/lib/estructura-utils'
import type { ElementoEstructuraTorneo } from '../detalle-torneo/components/gestion-fases-torneo/lib/tipos'
import { Card, CardContent } from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface TorneoCardProps {
  torneo: TorneoDTO
}

interface FaseResumen {
  id?: number
  numero?: number
  nombre?: string
  tipoDeFaseNombre?: string
}

function FaseItem({ fase }: { fase: FaseResumen }) {
  const titulo = `${fase.nombre ?? ''}`.trim()
  const subtitulo = fase.tipoDeFaseNombre ?? ''

  return (
    <li className='flex gap-3 rounded-md border border-border bg-muted/30 px-3 py-2'>
      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary'>
        {fase.numero}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium text-sm'>{titulo}</p>
        <p className='text-muted-foreground text-xs'>{subtitulo}</p>
      </div>
    </li>
  )
}

function GrupoEncabezado({ nombre }: { nombre: string }) {
  return (
    <li className='mt-1 list-none'>
      <p className='px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        {nombre}
      </p>
    </li>
  )
}

function renderElementos(
  elementos: ElementoEstructuraTorneo[],
  torneoFases: FaseDTO[]
): ReactNode[] {
  return elementos.flatMap((el) => {
    if (el.tipo === 'fase') {
      const faseApi = torneoFases.find((f) => f.id === el.fase.id)
      if (!faseApi) return []
      return [
        <FaseItem
          key={`fase-${el.fase.id}`}
          fase={{
            id: faseApi.id,
            numero: el.fase.numero,
            nombre: faseApi.nombre,
            tipoDeFaseNombre: faseApi.tipoDeFaseNombre
          }}
        />
      ]
    }

    return [
      <GrupoEncabezado
        key={`grupo-${el.grupo.idLocal}`}
        nombre={el.grupo.nombre}
      />,
      ...renderElementos(el.grupo.elementos, torneoFases)
    ]
  })
}

export default function TorneoCard({ torneo }: TorneoCardProps) {
  const navigate = useNavigate()
  const fases = torneo.fases ?? []
  const elementos =
    (torneo.gruposDeFases?.length ?? 0) > 0
      ? torneoAElementos(fases, torneo.gruposDeFases ?? [])
      : null

  const agrupador = torneo.torneoAgrupadorNombre ?? 'Sin agrupador'
  const horario =
    torneo.horarioDeJuego != null && torneo.horarioDeJuego !== ''
      ? ` · ${formatearHorarioDeJuego(torneo.horarioDeJuego)}`
      : ''
  const subtitulo = `${agrupador} - ${torneo.anio}${horario}`

  return (
    <Card
      className='cursor-pointer transition-shadow hover:shadow-md'
      onClick={() => navigate(`${rutasNavegacion.detalleTorneo}/${torneo.id}`)}
    >
      <CardContent className='flex flex-col gap-3 pt-4'>
        <div>
          <h3 className='flex items-center gap-2 font-semibold text-lg leading-tight'>
            <Icono nombre='Torneos' className='h-5 w-5 shrink-0 text-primary' />
            {torneo.nombre}
          </h3>
          <div className='my-2 flex items-center gap-2'>
            <p className='min-w-0 flex-1 text-sm text-muted-foreground'>
              {subtitulo}
            </p>
            <span
              className='inline-flex shrink-0 text-muted-foreground'
              title={
                torneo.esVisibleEnApp
                  ? 'Visible en la app'
                  : 'No visible en la app'
              }
            >
              <Icono
                nombre={torneo.esVisibleEnApp ? 'Visible' : 'NoVisible'}
                className='h-4 w-4'
              />
            </span>
          </div>
        </div>
        {elementos
          ? elementos.length > 0 && (
              <ul className='flex flex-col gap-1.5'>
                {renderElementos(elementos, fases)}
              </ul>
            )
          : fases.length > 0 && (
              <ul className='flex flex-col gap-1.5'>
                {fases.map((fase) => (
                  <FaseItem key={fase.id} fase={fase} />
                ))}
              </ul>
            )}
      </CardContent>
    </Card>
  )
}
