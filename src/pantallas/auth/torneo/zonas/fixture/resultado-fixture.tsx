import type { FixtureAlgoritmoFechaDTO } from '@/api/clients'
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

export function ResultadoFixture({
  fechas,
  lista
}: {
  fechas: FixtureAlgoritmoFechaDTO[]
  lista: ItemFixture[]
}) {
  const fechasConJornadas = buildFechasConJornadas(fechas)

  return (
    <div className='grid grid-cols-3 gap-4 py-4'>
      {fechasConJornadas.map((f) => (
        <div key={f.fecha} className='rounded-lg border bg-card p-4'>
          <h3 className='font-semibold mb-3 text-center'>Fecha {f.fecha}</h3>

          <div className='grid grid-cols-[10px_1fr_1fr_10px] gap-4 text-xs font-medium text-muted-foreground mb-1'>
            <span></span>
            <span className='text-right'>LOCAL</span>
            <span className='text-left'>VISITANTE</span>
            <span></span>
          </div>

          <div className='space-y-1'>
            <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
              {f.jornadas.map((j, i) => {
                const localNombre = resolverNombre(j.local, lista)
                const visitanteNombre = resolverNombre(j.visitante, lista)

                const getClase = (nombre: string) => {
                  if (nombre === 'Interzonal')
                    return 'text-blue-700 bg-blue-100 px-1 rounded'
                  if (nombre === 'Libre')
                    return 'text-yellow-700 bg-yellow-100 px-1 rounded'
                  return ''
                }

                return (
                  <div
                    key={i}
                    className='grid grid-cols-[10px_1fr_1fr_10px] gap-4 text-sm py-1'
                  >
                    <span className='text-center'>{j.local}</span>

                    <span className={`text-right ${getClase(localNombre)}`}>
                      {localNombre}
                    </span>

                    <span className={`text-left ${getClase(visitanteNombre)}`}>
                      {visitanteNombre}
                    </span>

                    <span className='text-center'>{j.visitante}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
