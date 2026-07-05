import type { ArbitroElegibleAsignacionDTO } from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import FilaJornadaAsignacion from '../asignacion/fila-jornada-asignacion'
import {
  formatearDiaCorto,
  type ContextoFechaHistorica
} from '../asignacion/utilidades-asignacion'
import FilaJornadaHistorica from './fila-jornada-historica'

interface VistaHistoricaPorJornadaProps {
  contexto: ContextoFechaHistorica | null
  modoEdicion: boolean
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  slotsPorJornada: Record<number, { arbitro1: string; arbitro2: string }>
  jornadaGuardandoId: number | null
  sinDatosHistoricos: boolean
  filtrosCompletos: boolean
  alCambiarArbitros: (
    jornadaId: number,
    arbitro1: string,
    arbitro2: string
  ) => void
}

function etiquetaFecha(contexto: ContextoFechaHistorica): string {
  const { fecha } = contexto
  return [
    fecha.diaSemana,
    fecha.dia ? formatearDiaCorto(fecha.dia) : null,
    fecha.numero != null ? `Fecha ${fecha.numero}` : null,
    fecha.instanciaNombre
  ]
    .filter(Boolean)
    .join(' · ')
}

export default function VistaHistoricaPorJornada({
  contexto,
  modoEdicion,
  arbitrosElegibles,
  slotsPorJornada,
  jornadaGuardandoId,
  sinDatosHistoricos,
  filtrosCompletos,
  alCambiarArbitros
}: VistaHistoricaPorJornadaProps) {
  if (sinDatosHistoricos) {
    return (
      <p
        className='py-8 text-center text-muted-foreground'
        data-testid='historico-vacio-por-jornada'
      >
        No hay fechas pasadas para este agrupador y año.
      </p>
    )
  }

  if (!filtrosCompletos || !contexto) {
    return (
      <p className='py-8 text-center text-muted-foreground'>
        Seleccioná torneo y fecha para ver las jornadas.
      </p>
    )
  }

  const jornadas = contexto.jornadas

  return (
    <div className='space-y-4' data-testid='historico-por-jornada'>
      <div className='space-y-2 rounded-lg border border-border bg-card p-4'>
        <p className='text-sm text-muted-foreground'>
          {contexto.torneo.nombre}
        </p>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='outline'>{contexto.faseNombre}</Badge>
          <Badge variant='outline'>{contexto.zonaNombre}</Badge>
          <Badge variant='secondary'>{etiquetaFecha(contexto)}</Badge>
        </div>
      </div>

      {jornadas.length === 0 ? (
        <p className='py-8 text-center text-muted-foreground'>
          No hay jornadas en la fecha seleccionada.
        </p>
      ) : (
        <div className='rounded-lg border border-border bg-card px-4'>
          {jornadas.map((jornada) => {
            const slots = slotsPorJornada[jornada.id!] ?? {
              arbitro1: 'sin-arbitro',
              arbitro2: 'sin-arbitro'
            }

            if (modoEdicion) {
              return (
                <FilaJornadaAsignacion
                  key={jornada.id}
                  jornada={jornada}
                  arbitrosElegibles={arbitrosElegibles}
                  categoriasFase={contexto.categoriasFase}
                  horarioDeJuegoTorneo={contexto.horarioDeJuegoTorneo}
                  arbitro1Id={slots.arbitro1}
                  arbitro2Id={slots.arbitro2}
                  whatsappEnviadoPorAsignacion={{}}
                  guardando={jornadaGuardandoId === jornada.id}
                  mostrarWhatsapp={false}
                  mostrarConflictos={false}
                  alCambiarArbitro1={(arbitroId) =>
                    alCambiarArbitros(jornada.id!, arbitroId, slots.arbitro2)
                  }
                  alCambiarArbitro2={(arbitroId) =>
                    alCambiarArbitros(jornada.id!, slots.arbitro1, arbitroId)
                  }
                  alMarcarWhatsappEnviado={() => {}}
                />
              )
            }

            return <FilaJornadaHistorica key={jornada.id} jornada={jornada} />
          })}
        </div>
      )}
    </div>
  )
}
