import type {
  AsignacionHistoricaArbitrosPorAgrupadorDTO,
  TorneoAsignacionHistoricaDTO
} from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { formatearDiaCorto } from '../asignacion/utilidades-asignacion'
import FilaJornadaHistorica from './fila-jornada-historica'

interface VistaHistoricaPorJornadaProps {
  data: AsignacionHistoricaArbitrosPorAgrupadorDTO
}

function SeccionColapsable({
  titulo,
  subtitulo,
  children,
  defaultAbierto = true
}: {
  titulo: string
  subtitulo?: string
  children: React.ReactNode
  defaultAbierto?: boolean
}) {
  const [abierto, setAbierto] = useState(defaultAbierto)
  return (
    <div className='rounded-lg border border-border bg-card'>
      <button
        type='button'
        className='flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/40'
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? (
          <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
        ) : (
          <ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground' />
        )}
        <div className='min-w-0'>
          <p className='font-medium'>{titulo}</p>
          {subtitulo && (
            <p className='text-sm text-muted-foreground'>{subtitulo}</p>
          )}
        </div>
      </button>
      {abierto && <div className='border-t border-border px-4'>{children}</div>}
    </div>
  )
}

function TorneoHistoricoTree({
  torneo
}: {
  torneo: TorneoAsignacionHistoricaDTO
}) {
  return (
    <SeccionColapsable titulo={torneo.nombre ?? 'Torneo'}>
      <div className='space-y-3 py-3'>
        {(torneo.fases ?? []).map((fase) => (
          <SeccionColapsable
            key={fase.id}
            titulo={fase.nombre ?? `Fase ${fase.id}`}
            defaultAbierto
          >
            <div className='space-y-3 py-3'>
              {(fase.zonas ?? []).map((zona) => (
                <Card key={zona.id} className='shadow-none'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>{zona.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 pt-0'>
                    {(zona.fechasHistoricas ?? []).map((fecha) => {
                      const etiquetaFecha = [
                        fecha.diaSemana,
                        fecha.dia ? formatearDiaCorto(fecha.dia) : null,
                        fecha.numero != null ? `Fecha ${fecha.numero}` : null,
                        fecha.instanciaNombre
                      ]
                        .filter(Boolean)
                        .join(' · ')

                      return (
                        <div key={fecha.fechaId} className='space-y-2'>
                          <Badge variant='secondary'>{etiquetaFecha}</Badge>
                          {(fecha.jornadas ?? []).map((jornada) => (
                            <FilaJornadaHistorica
                              key={jornada.id}
                              jornada={jornada}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </SeccionColapsable>
        ))}
      </div>
    </SeccionColapsable>
  )
}

export default function VistaHistoricaPorJornada({
  data
}: VistaHistoricaPorJornadaProps) {
  const torneos = data.torneos ?? []

  if (torneos.length === 0) {
    return (
      <p
        className='py-8 text-center text-muted-foreground'
        data-testid='historico-vacio-por-jornada'
      >
        No hay asignaciones históricas para este agrupador y año.
      </p>
    )
  }

  return (
    <div className='space-y-4' data-testid='historico-por-jornada'>
      {torneos.map((torneo) => (
        <TorneoHistoricoTree key={torneo.id} torneo={torneo} />
      ))}
    </div>
  )
}
