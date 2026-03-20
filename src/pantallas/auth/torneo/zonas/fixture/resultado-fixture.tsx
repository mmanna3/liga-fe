import { api } from '@/api/api'
import {
  type FixtureAlgoritmoFechaDTO,
  type JornadaDTO,
  type TorneoFechaDTO
} from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Card, CardContent } from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useQueryClient } from '@tanstack/react-query'
import { addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ItemFixture } from './types'

type JornadaItem = { local: number; visitante: number }
type FechaConJornadas = { fecha: number; jornadas: JornadaItem[] }

function buildFechasConJornadas(
  fechas: FixtureAlgoritmoFechaDTO[]
): FechaConJornadas[] {
  const map = new Map<number, JornadaItem[]>()
  for (const f of [...fechas].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))) {
    if (!map.has(f.fecha)) map.set(f.fecha, [])
    map
      .get(f.fecha)!
      .push({ local: f.equipoLocal, visitante: f.equipoVisitante })
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([fecha, jornadas]) => ({ fecha, jornadas }))
}

function resolverNombre(numero: number, lista: ItemFixture[]): string {
  const item = lista[numero - 1]
  if (!item) return `#${numero}`
  if (item.type === 'especial')
    return item.valor === 'INTERZONAL' ? 'Interzonal' : 'Libre'
  return item.equipo.nombre ?? '—'
}

function buildJornada(j: JornadaItem, lista: ItemFixture[]): JornadaDTO {
  const local = lista[j.local - 1]
  const visitante = lista[j.visitante - 1]

  if (local?.type === 'equipo' && visitante?.type === 'equipo') {
    return {
      tipo: 'Normal',
      resultadosVerificados: false,
      localId: local.equipo.id!,
      visitanteId: visitante.equipo.id!
    } as unknown as JornadaDTO
  }
  if (local?.type === 'equipo' && visitante?.type === 'especial') {
    return visitante.valor === 'LIBRE'
      ? ({
          tipo: 'Libre',
          resultadosVerificados: false,
          equipoId: local.equipo.id!
        } as unknown as JornadaDTO)
      : ({
          tipo: 'Interzonal',
          resultadosVerificados: false,
          equipoId: local.equipo.id!,
          localOVisitante: 1
        } as unknown as JornadaDTO)
  }
  if (local?.type === 'especial' && visitante?.type === 'equipo') {
    return local.valor === 'LIBRE'
      ? ({
          tipo: 'Libre',
          resultadosVerificados: false,
          equipoId: visitante.equipo.id!
        } as unknown as JornadaDTO)
      : ({
          tipo: 'Interzonal',
          resultadosVerificados: false,
          equipoId: visitante.equipo.id!,
          localOVisitante: 2
        } as unknown as JornadaDTO)
  }
  return {
    tipo: 'Normal',
    resultadosVerificados: false
  } as unknown as JornadaDTO
}

function buildPayload(
  fechas: FixtureAlgoritmoFechaDTO[],
  lista: ItemFixture[],
  primeraFecha: Date
): TorneoFechaDTO[] {
  return buildFechasConJornadas(fechas).map((f, index) => {
    const dia = addWeeks(primeraFecha, index)
    return {
      numero: f.fecha,
      dia,
      esVisibleEnApp: false,
      jornadas: f.jornadas.map((j) => buildJornada(j, lista))
    } as TorneoFechaDTO
  })
}

const claseEspecial = (nombre: string) => {
  if (nombre === 'Interzonal') return 'text-blue-700 bg-blue-100 px-1 rounded'
  if (nombre === 'Libre') return 'text-yellow-700 bg-yellow-100 px-1 rounded'
  return ''
}

export function ResultadoFixture({
  fechas,
  lista,
  zonaId,
  primeraFecha
}: {
  fechas: FixtureAlgoritmoFechaDTO[]
  lista: ItemFixture[]
  zonaId: number
  primeraFecha: Date
}) {
  const queryClient = useQueryClient()
  const fechasConJornadas = buildFechasConJornadas(fechas)

  const crearMutation = useApiMutation<TorneoFechaDTO[]>({
    fn: (body) => api.crearFechasMasivamente(zonaId, body),
    mensajeDeExito: 'Fechas y jornadas creadas correctamente',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
    }
  })

  return (
    <div>
      <Card className=''>
        {/* <CardHeader>
          <CardTitle>Crear fixture</CardTitle>
        </CardHeader> */}
        <CardContent>
          <Boton
            onClick={() =>
              crearMutation.mutate(buildPayload(fechas, lista, primeraFecha))
            }
            estaCargando={crearMutation.isPending}
          >
            Crear el fixture con las fechas que aparecen a continuación
          </Boton>
          <span className='text-sm text-muted-foreground font-light mt-2 ml-3'>
            El fixture generado, de ser necesario, podrá modificarse luego.
          </span>
        </CardContent>
      </Card>

      <div className='grid grid-cols-3 gap-4 py-4'>
        {fechasConJornadas.map((f, index) => {
          const dia = addWeeks(primeraFecha, index)
          return (
            <div key={f.fecha} className='rounded-lg border bg-card p-4'>
              <h3 className='font-semibold mb-1 text-center'>
                Fecha {f.fecha}
              </h3>
              <p className='text-xs text-muted-foreground mb-6 text-center'>
                {format(dia, "EEEE d 'de' MMMM", { locale: es })}
              </p>

              <div className='grid grid-cols-[10px_1fr_1fr_10px] gap-4 text-xs font-medium text-muted-foreground mb-1'>
                <span></span>
                <span className='text-right'>LOCAL</span>
                <span className='text-left'>VISITANTE</span>
                <span></span>
              </div>

              <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
                {f.jornadas.map((j, i) => {
                  const localNombre = resolverNombre(j.local, lista)
                  const visitanteNombre = resolverNombre(j.visitante, lista)
                  return (
                    <div
                      key={i}
                      className='grid grid-cols-[10px_1fr_1fr_10px] gap-4 text-sm py-1'
                    >
                      <span className='text-center'>{j.local}</span>
                      <span
                        className={`text-right ${claseEspecial(localNombre)}`}
                      >
                        {localNombre}
                      </span>
                      <span
                        className={`text-left ${claseEspecial(visitanteNombre)}`}
                      >
                        {visitanteNombre}
                      </span>
                      <span className='text-center'>{j.visitante}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
