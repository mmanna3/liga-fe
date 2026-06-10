import type {
  ArbitroElegibleAsignacionDTO,
  AsignacionArbitrosPorAgrupadorDTO,
  TorneoAsignacionDTO
} from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { cn } from '@/logica-compartida/utils'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import FilaJornadaAsignacion from './fila-jornada-asignacion'
import {
  formatearDiaCorto,
  jornadaTieneAsignacion
} from './utilidades-asignacion'

interface VistaPorJornadaProps {
  data: AsignacionArbitrosPorAgrupadorDTO
  slotsPorJornada: Record<number, { arbitro1: string; arbitro2: string }>
  whatsappEnviadoPorAsignacion: Record<string, boolean>
  jornadaGuardandoId: number | null
  alCambiarArbitros: (
    jornadaId: number,
    arbitro1: string,
    arbitro2: string
  ) => void
  alMarcarWhatsappEnviado: (jornadaId: number, arbitroId: number) => void
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

function TorneoAsignacionTree({
  torneo,
  arbitrosElegibles,
  slotsPorJornada,
  whatsappEnviadoPorAsignacion,
  jornadaGuardandoId,
  alCambiarArbitros,
  alMarcarWhatsappEnviado
}: {
  torneo: TorneoAsignacionDTO
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  slotsPorJornada: Record<number, { arbitro1: string; arbitro2: string }>
  whatsappEnviadoPorAsignacion: Record<string, boolean>
  jornadaGuardandoId: number | null
  alCambiarArbitros: (
    jornadaId: number,
    arbitro1: string,
    arbitro2: string
  ) => void
  alMarcarWhatsappEnviado: (jornadaId: number, arbitroId: number) => void
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
              {(fase.zonas ?? []).map((zona) => {
                const pf = zona.proximaFecha
                if (!pf) return null
                const etiquetaFecha = [
                  pf.diaSemana,
                  pf.dia ? formatearDiaCorto(pf.dia) : null,
                  pf.numero != null ? `Fecha ${pf.numero}` : null,
                  pf.instanciaNombre
                ]
                  .filter(Boolean)
                  .join(' · ')

                const jornadas = pf.jornadas ?? []
                const zonaCompleta =
                  jornadas.length > 0 &&
                  jornadas.every((j) => {
                    const slots = slotsPorJornada[j.id] ?? {
                      arbitro1: 'sin-arbitro',
                      arbitro2: 'sin-arbitro'
                    }
                    return jornadaTieneAsignacion(
                      slots.arbitro1,
                      slots.arbitro2
                    )
                  })

                return (
                  <Card key={zona.id} className='shadow-none'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='flex flex-wrap items-center gap-2 text-base'>
                        <span>{zona.nombre}</span>
                        <Badge
                          variant='secondary'
                          className={cn(
                            zonaCompleta &&
                              'border-emerald-600 bg-emerald-100 text-emerald-900'
                          )}
                        >
                          {zonaCompleta && (
                            <Check className='mr-1 h-3 w-3' aria-hidden />
                          )}
                          {etiquetaFecha}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      {jornadas.map((jornada) => {
                        const slots = slotsPorJornada[jornada.id] ?? {
                          arbitro1: 'sin-arbitro',
                          arbitro2: 'sin-arbitro'
                        }
                        return (
                          <FilaJornadaAsignacion
                            key={jornada.id}
                            jornada={jornada}
                            arbitrosElegibles={arbitrosElegibles}
                            arbitro1Id={slots.arbitro1}
                            arbitro2Id={slots.arbitro2}
                            whatsappEnviadoPorAsignacion={
                              whatsappEnviadoPorAsignacion
                            }
                            guardando={jornadaGuardandoId === jornada.id}
                            alCambiarArbitro1={(id) =>
                              alCambiarArbitros(jornada.id, id, slots.arbitro2)
                            }
                            alCambiarArbitro2={(id) =>
                              alCambiarArbitros(jornada.id, slots.arbitro1, id)
                            }
                            alMarcarWhatsappEnviado={alMarcarWhatsappEnviado}
                          />
                        )
                      })}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </SeccionColapsable>
        ))}
      </div>
    </SeccionColapsable>
  )
}

export default function VistaPorJornada({
  data,
  slotsPorJornada,
  whatsappEnviadoPorAsignacion,
  jornadaGuardandoId,
  alCambiarArbitros,
  alMarcarWhatsappEnviado
}: VistaPorJornadaProps) {
  const torneos = data.torneos ?? []
  const arbitrosElegibles = data.arbitrosElegibles ?? []

  if (torneos.length === 0) {
    return (
      <p className='py-8 text-center text-muted-foreground'>
        No hay próximas fechas con día cargado para este agrupador y año.
      </p>
    )
  }

  return (
    <div className='space-y-4'>
      {torneos.map((torneo) => (
        <TorneoAsignacionTree
          key={torneo.id}
          torneo={torneo}
          arbitrosElegibles={arbitrosElegibles}
          slotsPorJornada={slotsPorJornada}
          whatsappEnviadoPorAsignacion={whatsappEnviadoPorAsignacion}
          jornadaGuardandoId={jornadaGuardandoId}
          alCambiarArbitros={alCambiarArbitros}
          alMarcarWhatsappEnviado={alMarcarWhatsappEnviado}
        />
      ))}
    </div>
  )
}
