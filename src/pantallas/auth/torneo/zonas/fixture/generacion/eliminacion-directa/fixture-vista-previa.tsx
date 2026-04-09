import { api } from '@/api/api'
import type { FechaEliminacionDirectaDTO, JornadaDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Card, CardContent } from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useQueryClient } from '@tanstack/react-query'
import { addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ItemFixture } from '../../tipos'

function nombreParaBracket(item: ItemFixture): string {
  if (item.type === 'equipo') return item.equipo.nombre ?? '—'
  return item.valor === 'INTERZONAL' ? 'Interzonal' : 'Libre'
}

export interface PartidoBracket {
  local: string | null
  visitante: string | null
}

export interface InstanciaBracket {
  nombre: string
  partidos: PartidoBracket[]
}

export const NOMBRES_INSTANCIA_BRACKET: Record<number, string> = {
  16: 'Octavos de final',
  8: 'Cuartos de final',
  4: 'Semifinal',
  2: 'Final'
}

export function buildBracket(nombres: string[]): InstanciaBracket[] {
  const n = nombres.length
  const totalRondas = Math.log2(n)
  const instancias: InstanciaBracket[] = []

  for (let r = 0; r < totalRondas; r++) {
    const equiposEnRonda = n / Math.pow(2, r)
    const cantidadPartidos = equiposEnRonda / 2
    const nombre = NOMBRES_INSTANCIA_BRACKET[equiposEnRonda] ?? `Ronda ${r + 1}`

    if (r === 0) {
      const partidos: PartidoBracket[] = []
      for (let i = 0; i < cantidadPartidos; i++) {
        partidos.push({
          local: nombres[i * 2] ?? null,
          visitante: nombres[i * 2 + 1] ?? null
        })
      }
      instancias.push({ nombre, partidos })
    } else {
      instancias.push({
        nombre,
        partidos: Array.from({ length: cantidadPartidos }, () => ({
          local: null,
          visitante: null
        }))
      })
    }
  }

  return instancias
}

type JornadaItem = { local: number; visitante: number }

function partidoBracketAJornadaItem(
  p: PartidoBracket,
  lista: ItemFixture[]
): JornadaItem {
  function indice1Based(nombre: string | null): number {
    if (nombre == null) return 0
    const i = lista.findIndex((item) => nombreParaBracket(item) === nombre)
    return i >= 0 ? i + 1 : 0
  }
  return {
    local: indice1Based(p.local),
    visitante: indice1Based(p.visitante)
  }
}

/** Partido cuyos dos slots son LIBRE o INTERZONAL: no se persiste en el backend. */
function esPartidoEntreDosEspeciales(
  partido: PartidoBracket,
  lista: ItemFixture[]
): boolean {
  const j = partidoBracketAJornadaItem(partido, lista)
  const local = lista[j.local - 1]
  const visitante = lista[j.visitante - 1]
  return local?.type === 'especial' && visitante?.type === 'especial'
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
          equipoLocalId: local.equipo.id!
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
          equipoLocalId: visitante.equipo.id!
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

export function buildPayloadEliminacionDirecta(
  lista: ItemFixture[],
  primeraFecha: Date
): FechaEliminacionDirectaDTO | null {
  const nombres = lista.map(nombreParaBracket)
  const instanciasCompletas = buildBracket(nombres)
  const primeraInstancia = instanciasCompletas[0]
  const n = lista.length

  if (!primeraInstancia) return null

  const instanciaId = n
  const jornadas = primeraInstancia.partidos
    .filter((partido) => !esPartidoEntreDosEspeciales(partido, lista))
    .map((partido) => {
      const j = partidoBracketAJornadaItem(partido, lista)
      return buildJornada(j, lista)
    })

  return {
    dia: primeraFecha,
    esVisibleEnApp: false,
    instanciaId,
    jornadas
  } as FechaEliminacionDirectaDTO
}

export function claseEspecialBracket(nombre: string | null): string {
  if (nombre === 'Interzonal') return 'text-blue-700 bg-blue-100 px-1 rounded'
  if (nombre === 'Libre') return 'text-yellow-700 bg-yellow-100 px-1 rounded'
  return ''
}

export function PartidoCardBracket({
  local,
  visitante,
  resultadoLocal,
  resultadoVisitante,
  penalesLocal,
  penalesVisitante
}: {
  local: string | null
  visitante: string | null
  /** Si se pasa (incluso `null`), muestra el cuadrado de resultado al final de cada fila. */
  resultadoLocal?: string | null
  resultadoVisitante?: string | null
  /** Si hay penales, se muestran entre paréntesis a la derecha del resultado. */
  penalesLocal?: string | null
  penalesVisitante?: string | null
}) {
  const mostrarResultados = resultadoLocal !== undefined

  function CeldaResultado({
    valor,
    penales
  }: {
    valor: string | null | undefined
    penales?: string | null
  }) {
    const gol =
      valor != null && String(valor).trim() !== '' ? String(valor) : '—'
    const pen =
      penales != null && String(penales).trim() !== ''
        ? ` (${String(penales).trim()})`
        : ''
    return (
      <div className='min-w-[2rem] shrink-0 self-stretch flex items-center justify-center border-l border-border pl-2 text-xs tabular-nums font-medium'>
        <span>{gol}</span>
        {pen ? (
          <span className='text-muted-foreground whitespace-nowrap'>{pen}</span>
        ) : null}
      </div>
    )
  }

  return (
    <div className='rounded border bg-card text-sm w-full'>
      <div className='px-3 py-2 border-b flex items-center gap-0 min-h-10'>
        <div className='flex-1 min-w-0 truncate'>
          {local != null ? (
            <span className={claseEspecialBracket(local)}>{local}</span>
          ) : (
            <span className='text-muted-foreground italic'>Por definir</span>
          )}
        </div>
        {mostrarResultados && (
          <CeldaResultado
            valor={resultadoLocal ?? null}
            penales={penalesLocal}
          />
        )}
      </div>
      <div className='px-3 py-2 flex items-center gap-0 min-h-10'>
        <div className='flex-1 min-w-0 truncate'>
          {visitante != null ? (
            <span className={claseEspecialBracket(visitante)}>{visitante}</span>
          ) : (
            <span className='text-muted-foreground italic'>Por definir</span>
          )}
        </div>
        {mostrarResultados && (
          <CeldaResultado
            valor={resultadoVisitante ?? null}
            penales={penalesVisitante}
          />
        )}
      </div>
    </div>
  )
}

// Altura mínima de cada slot de primera ronda (px).
// Cada ronda siguiente dobla esta altura, garantizando que todas las columnas
// tengan el mismo alto total y la card crezca para contener todo el contenido.
export const ALTURA_SLOT_BRACKET_BASE = 96

export function FixtureVistaPrevia({
  lista,
  primeraFecha,
  zonaId
}: {
  lista: ItemFixture[]
  primeraFecha: Date
  zonaId: number
}) {
  const queryClient = useQueryClient()
  const nombres = lista.map(nombreParaBracket)
  const instancias = buildBracket(nombres)

  const crearMutation = useApiMutation<FechaEliminacionDirectaDTO>({
    fn: (body) => api.crearFechasEliminaciondirectaMasivamente(zonaId, body),
    mensajeDeExito: 'Fechas y jornadas creadas correctamente',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      queryClient.invalidateQueries({
        queryKey: ['fechasEliminacionDirecta', zonaId]
      })
    }
  })

  return (
    <div>
      <Card className='mb-4'>
        {/* <CardHeader>
          <CardTitle>Crear fixture</CardTitle>
        </CardHeader> */}
        <CardContent>
          <Boton
            onClick={() => {
              const payload = buildPayloadEliminacionDirecta(
                lista,
                primeraFecha
              )
              if (payload != null) crearMutation.mutate(payload)
            }}
            estaCargando={crearMutation.isPending}
          >
            Crear el fixture con las fechas que aparecen a continuación
          </Boton>
          <span className='text-sm text-muted-foreground font-light mt-2 ml-3'>
            El fixture generado, de ser necesario, podrá modificarse luego.
          </span>
        </CardContent>
      </Card>

      {/* Títulos de instancias — fuera de la card */}
      <div className='flex gap-6 mb-2'>
        {instancias.map((instancia, rIdx) => {
          const fecha = addWeeks(primeraFecha, rIdx)
          return (
            <div key={rIdx} className='flex-1 min-w-[200px] text-center'>
              <h4 className='text-sm font-semibold'>{instancia.nombre}</h4>
              <p className='text-xs text-muted-foreground'>
                {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
          )
        })}
      </div>

      {/* Card que contiene todas las rondas */}
      <Card>
        <CardContent>
          <div className='flex gap-6'>
            {instancias.map((instancia, rIdx) => {
              const alturaSlot = ALTURA_SLOT_BRACKET_BASE * Math.pow(2, rIdx)
              return (
                <div key={rIdx} className='flex flex-col flex-1 min-w-[200px]'>
                  {instancia.partidos.map((partido, mIdx) => (
                    <div
                      key={mIdx}
                      className='flex items-center py-3'
                      style={{ height: alturaSlot }}
                    >
                      <PartidoCardBracket
                        local={partido.local}
                        visitante={partido.visitante}
                      />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
