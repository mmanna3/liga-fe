import { cn } from '@/logica-compartida/utils'
import { Trophy } from 'lucide-react'
import type { EquipoWizard, Zona } from '../tipos'

interface VistaBracketProps {
  totalSlots: number
  equipos: Array<Pick<EquipoWizard, 'nombre'>>
  zonas: Zona[]
}

export function VistaBracket({ totalSlots, equipos }: VistaBracketProps) {
  const rondas = Math.ceil(Math.log2(totalSlots))
  const partidosPorRonda: number[] = []

  for (let i = 0; i < rondas; i++) {
    partidosPorRonda.push(Math.pow(2, rondas - i - 1))
  }

  const obtenerNombreRonda = (index: number) => {
    const restantes = partidosPorRonda[index] * 2
    if (restantes === 2) return 'Final'
    if (restantes === 4) return 'Semifinal'
    if (restantes === 8) return 'Cuartos'
    if (restantes === 16) return 'Octavos'
    return `1/${restantes}`
  }

  const obtenerNombreEquipo = (index: number) => {
    if (equipos[index]) {
      return equipos[index].nombre
    }
    return `Equipo ${index + 1}`
  }

  const obtenerClaseSlotEquipo = (index: number) => {
    const nombre = equipos[index]?.nombre
    if (nombre === 'LIBRE') return 'bg-amber-50 border-amber-200'
    if (nombre === 'INTERZONAL') return 'bg-blue-50 border-blue-200'
    return ''
  }

  return (
    <div className='bg-muted rounded-xl p-6 overflow-x-auto'>
      <div className='flex justify-center min-w-max'>
        <div className='flex gap-8 items-center'>
          {partidosPorRonda.map((cantPartidos, indexRonda) => {
            const esUltimaRonda = indexRonda === partidosPorRonda.length - 1

            return (
              <div key={indexRonda} className='flex items-center gap-4'>
                <div className='flex flex-col items-center'>
                  <div className='mb-4 px-4 py-2 bg-background rounded-xl shadow-sm border'>
                    <span className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>
                      {obtenerNombreRonda(indexRonda)}
                    </span>
                  </div>

                  <div
                    className='flex flex-col justify-around h-full'
                    style={{
                      gap: `${Math.pow(2, indexRonda + 1) * 8}px`
                    }}
                  >
                    {Array.from({ length: cantPartidos }).map(
                      (_, indexPartido) => {
                        const indexEquipo1 = indexPartido * 2
                        const indexEquipo2 = indexPartido * 2 + 1

                        return (
                          <div key={indexPartido} className='relative'>
                            <div className='bg-background rounded-lg border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow w-40'>
                              <div
                                className={cn(
                                  'flex items-center justify-between px-3 py-2.5 border-b hover:bg-accent transition-colors group',
                                  indexRonda === 0 &&
                                    obtenerClaseSlotEquipo(indexEquipo1)
                                )}
                              >
                                <span
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    equipos[indexEquipo1]?.nombre === 'LIBRE' &&
                                      'text-amber-700 italic',
                                    equipos[indexEquipo1]?.nombre ===
                                      'INTERZONAL' && 'text-blue-700 italic',
                                    indexRonda > 0 && 'group-hover:text-primary'
                                  )}
                                >
                                  {indexRonda === 0
                                    ? obtenerNombreEquipo(indexEquipo1)
                                    : `Ganador ${indexEquipo1 + 1}`}
                                </span>
                                <span className='text-xs font-bold text-muted-foreground ml-2'>
                                  -
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors group',
                                  indexRonda === 0 &&
                                    obtenerClaseSlotEquipo(indexEquipo2)
                                )}
                              >
                                <span
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    equipos[indexEquipo2]?.nombre === 'LIBRE' &&
                                      'text-amber-700 italic',
                                    equipos[indexEquipo2]?.nombre ===
                                      'INTERZONAL' && 'text-blue-700 italic',
                                    indexRonda > 0 && 'group-hover:text-primary'
                                  )}
                                >
                                  {indexRonda === 0
                                    ? obtenerNombreEquipo(indexEquipo2)
                                    : `Ganador ${indexEquipo2 + 1}`}
                                </span>
                                <span className='text-xs font-bold text-muted-foreground ml-2'>
                                  -
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>

                {!esUltimaRonda && (
                  <div
                    className='flex flex-col justify-around h-full'
                    style={{
                      gap: `${Math.pow(2, indexRonda + 2) * 8}px`
                    }}
                  >
                    {Array.from({
                      length: Math.ceil(cantPartidos / 2)
                    }).map((_, indexLinea) => (
                      <div
                        key={indexLinea}
                        className='relative w-8 flex items-center justify-center'
                      >
                        <svg
                          width='32'
                          height={Math.pow(2, indexRonda + 2) * 44}
                          className='overflow-visible'
                        >
                          <line
                            x1='0'
                            y1={
                              Math.pow(2, indexRonda + 1) * 22 -
                              Math.pow(2, indexRonda) * 22
                            }
                            x2='16'
                            y2={
                              Math.pow(2, indexRonda + 1) * 22 -
                              Math.pow(2, indexRonda) * 22
                            }
                            stroke='#D1D5DB'
                            strokeWidth='2'
                          />
                          <line
                            x1='16'
                            y1={
                              Math.pow(2, indexRonda + 1) * 22 -
                              Math.pow(2, indexRonda) * 22
                            }
                            x2='16'
                            y2={
                              Math.pow(2, indexRonda + 1) * 22 +
                              Math.pow(2, indexRonda) * 22
                            }
                            stroke='#D1D5DB'
                            strokeWidth='2'
                          />
                          <line
                            x1='0'
                            y1={
                              Math.pow(2, indexRonda + 1) * 22 +
                              Math.pow(2, indexRonda) * 22
                            }
                            x2='16'
                            y2={
                              Math.pow(2, indexRonda + 1) * 22 +
                              Math.pow(2, indexRonda) * 22
                            }
                            stroke='#D1D5DB'
                            strokeWidth='2'
                          />
                          <line
                            x1='16'
                            y1={Math.pow(2, indexRonda + 1) * 22}
                            x2='32'
                            y2={Math.pow(2, indexRonda + 1) * 22}
                            stroke='currentColor'
                            className='text-primary'
                            strokeWidth='2'
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <div className='flex flex-col items-center'>
            <div className='mb-4 px-4 py-2 bg-amber-100 rounded-xl shadow-sm border border-amber-300'>
              <span className='text-xs font-bold text-amber-800 uppercase tracking-wide'>
                Campeón
              </span>
            </div>
            <div className='w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg'>
              <Trophy className='w-10 h-10 text-primary-foreground' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
