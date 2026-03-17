import type { FixtureAlgoritmoFechaDTO } from '@/api/clients'
import type { ItemFixture } from './types'

type JornadaItem = { local: number; visitante: number }
type FechaConJornadas = { fecha: number; jornadas: JornadaItem[] }

function buildFechasConJornadas(
  fechas: FixtureAlgoritmoFechaDTO[]
): FechaConJornadas[] {
  const map = new Map<number, JornadaItem[]>()
  for (const f of fechas) {
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
    <div className='space-y-4 py-4'>
      {fechasConJornadas.map((f) => (
        <div key={f.fecha} className='rounded-lg border bg-card p-4'>
          <h3 className='font-semibold mb-3'>Fecha {f.fecha}</h3>
          <div className='grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground mb-1'>
            <span>LOCAL</span>
            <span>VISITANTE</span>
          </div>
          <div className='space-y-1'>
            {f.jornadas.map((j, i) => (
              <div key={i} className='grid grid-cols-2 gap-4 text-sm py-1'>
                <span>
                  {j.local} {resolverNombre(j.local, lista)}
                </span>
                <span className='text-muted-foreground'>
                  {j.visitante} {resolverNombre(j.visitante, lista)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
