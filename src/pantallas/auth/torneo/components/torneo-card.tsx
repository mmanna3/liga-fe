import type { TorneoDTO, FaseDTO } from '@/api/clients'
import { formatearHorarioDeJuego } from '../detalle-torneo/lib'
import { torneoAElementos } from '../detalle-torneo/components/gestion-fases-torneo/lib/estructura-utils'
import type {
  ElementoEstructuraTorneo,
  GrupoDeFasesEstado
} from '../detalle-torneo/components/gestion-fases-torneo/lib/tipos'
import { Card, CardContent } from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'

interface TorneoCardProps {
  torneo: TorneoDTO
}

interface FaseResumen {
  id?: number
  numero?: number
  nombre?: string
  tipoDeFaseNombre?: string
}

function FilaElementoTopLevel({
  numero,
  titulo,
  subtitulo
}: {
  numero?: number
  titulo: string
  subtitulo?: string
}) {
  return (
    <div className='flex min-w-0 gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5'>
      <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary'>
        {numero}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{titulo}</p>
        {subtitulo && (
          <p className='truncate text-xs text-muted-foreground'>{subtitulo}</p>
        )}
      </div>
    </div>
  )
}

function FilaElementoHijo({
  numero,
  titulo,
  subtitulo,
  numeroSutil = false
}: {
  numero?: number
  titulo: string
  subtitulo?: string
  numeroSutil?: boolean
}) {
  return (
    <div className='flex min-w-0 gap-2 rounded-sm px-1 py-0.5'>
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]',
          numeroSutil
            ? 'border border-dashed border-muted-foreground/40 font-medium text-muted-foreground'
            : 'bg-primary/15 font-semibold text-primary'
        )}
      >
        {numero}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-xs font-medium leading-tight'>{titulo}</p>
        {subtitulo && (
          <p className='truncate text-[10px] leading-tight text-muted-foreground'>
            {subtitulo}
          </p>
        )}
      </div>
    </div>
  )
}

function FaseResumenItem({
  fase,
  compact = false,
  dentroDeSubgrupo = false
}: {
  fase: FaseResumen
  compact?: boolean
  dentroDeSubgrupo?: boolean
}) {
  const titulo = `${fase.nombre ?? ''}`.trim()
  const subtitulo = fase.tipoDeFaseNombre ?? ''

  if (compact) {
    return (
      <li>
        <FilaElementoHijo
          numero={fase.numero}
          titulo={titulo}
          subtitulo={subtitulo}
          numeroSutil={dentroDeSubgrupo}
        />
      </li>
    )
  }

  return (
    <li>
      <FilaElementoTopLevel
        numero={fase.numero}
        titulo={titulo}
        subtitulo={subtitulo}
      />
    </li>
  )
}

function GrupoResumen({
  grupo,
  torneoFases,
  profundidad
}: {
  grupo: GrupoDeFasesEstado
  torneoFases: FaseDTO[]
  profundidad: number
}) {
  const esSubgrupo = profundidad > 1

  if (esSubgrupo) {
    return (
      <li className='list-none'>
        <FilaElementoHijo numero={grupo.numero} titulo={grupo.nombre} />
        {grupo.elementos.length > 0 && (
          <EstructuraFasesResumen
            elementos={grupo.elementos}
            torneoFases={torneoFases}
            profundidad={profundidad}
            anidado
          />
        )}
      </li>
    )
  }

  return (
    <li className='list-none'>
      <FilaElementoTopLevel numero={grupo.numero} titulo={grupo.nombre} />
      {grupo.elementos.length > 0 && (
        <EstructuraFasesResumen
          elementos={grupo.elementos}
          torneoFases={torneoFases}
          profundidad={profundidad}
          anidado
        />
      )}
    </li>
  )
}

function EstructuraFasesResumen({
  elementos,
  torneoFases,
  profundidad = 0,
  anidado = false
}: {
  elementos: ElementoEstructuraTorneo[]
  torneoFases: FaseDTO[]
  profundidad?: number
  anidado?: boolean
}) {
  const dentroDeGrupo = profundidad > 0

  return (
    <ul
      className={cn(
        'flex flex-col',
        anidado
          ? 'ml-4 gap-0.5 border-l border-border pl-2'
          : dentroDeGrupo
            ? 'gap-0.5'
            : 'gap-1.5'
      )}
    >
      {elementos.map((el, index) => {
        if (el.tipo === 'fase') {
          const faseApi = torneoFases.find((f) => f.id === el.fase.id)
          if (!faseApi) return null
          return (
            <FaseResumenItem
              key={`fase-${el.fase.id ?? index}`}
              fase={{
                id: faseApi.id,
                numero: el.fase.numero,
                nombre: faseApi.nombre,
                tipoDeFaseNombre: faseApi.tipoDeFaseNombre
              }}
              compact={dentroDeGrupo}
              dentroDeSubgrupo={profundidad > 1}
            />
          )
        }

        return (
          <GrupoResumen
            key={el.grupo.idLocal}
            grupo={el.grupo}
            torneoFases={torneoFases}
            profundidad={profundidad + 1}
          />
        )
      })}
    </ul>
  )
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

  const hayFases = elementos ? elementos.length > 0 : fases.length > 0

  return (
    <Card
      className='cursor-pointer transition-shadow hover:shadow-md'
      onClick={() => navigate(`${rutasNavegacion.detalleTorneo}/${torneo.id}`)}
    >
      <CardContent className='flex flex-col gap-3 pt-4'>
        <div>
          <h3 className='flex items-center gap-2 font-semibold text-lg leading-tight'>
            <Icono nombre='Torneos' className='h-5 w-5 shrink-0 text-primary' />
            <span className='min-w-0 truncate'>{torneo.nombre}</span>
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
        {hayFases && (
          <div className='border-t border-border pt-2'>
            {elementos ? (
              <EstructuraFasesResumen
                elementos={elementos}
                torneoFases={fases}
              />
            ) : (
              <ul className='flex flex-col gap-1.5'>
                {fases.map((fase) => (
                  <FaseResumenItem key={fase.id} fase={fase} />
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
