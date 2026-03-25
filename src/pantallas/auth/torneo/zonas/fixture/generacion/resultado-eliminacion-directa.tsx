import { Card, CardContent } from '@/design-system/base-ui/card'
import type { ItemFixture } from '../tipos'

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

const NOMBRES_INSTANCIA: Record<number, string> = {
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
    const nombre = NOMBRES_INSTANCIA[equiposEnRonda] ?? `Ronda ${r + 1}`

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

function PartidoCard({
  local,
  visitante
}: {
  local: string | null
  visitante: string | null
}) {
  return (
    <div className='rounded border bg-card text-sm w-full'>
      <div className='px-3 py-2 border-b truncate'>
        {local ?? (
          <span className='text-muted-foreground italic'>Por definir</span>
        )}
      </div>
      <div className='px-3 py-2 truncate'>
        {visitante ?? (
          <span className='text-muted-foreground italic'>Por definir</span>
        )}
      </div>
    </div>
  )
}

// Altura mínima de cada slot de primera ronda (px).
// Cada ronda siguiente dobla esta altura, garantizando que todas las columnas
// tengan el mismo alto total y la card crezca para contener todo el contenido.
const ALTURA_SLOT_BASE = 96

export function ResultadoEliminacionDirecta({
  lista
}: {
  lista: ItemFixture[]
}) {
  const nombres = lista.map(nombreParaBracket)
  const instancias = buildBracket(nombres)

  return (
    <div>
      {/* Títulos de instancias — fuera de la card */}
      <div className='flex gap-6 mb-2'>
        {instancias.map((instancia, rIdx) => (
          <h4
            key={rIdx}
            className='flex-1 min-w-[200px] text-sm font-semibold text-center'
          >
            {instancia.nombre}
          </h4>
        ))}
      </div>

      {/* Card que contiene todas las rondas */}
      <Card>
        <CardContent>
          <div className='flex gap-6'>
            {instancias.map((instancia, rIdx) => {
              const alturaSlot = ALTURA_SLOT_BASE * Math.pow(2, rIdx)
              return (
                <div key={rIdx} className='flex flex-col flex-1 min-w-[200px]'>
                  {instancia.partidos.map((partido, mIdx) => (
                    <div
                      key={mIdx}
                      className='flex items-center py-3'
                      style={{ height: alturaSlot }}
                    >
                      <PartidoCard
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
