import { Trophy } from 'lucide-react'
import type { WizardTeam, Zone } from '../types'

interface BracketViewProps {
  teamSlots: number
  teams: WizardTeam[]
  zones: Zone[]
}

export function BracketView({ teamSlots, teams }: BracketViewProps) {
  const rounds = Math.ceil(Math.log2(teamSlots))
  const matchesPerRound: number[] = []

  for (let i = 0; i < rounds; i++) {
    matchesPerRound.push(Math.pow(2, rounds - i - 1))
  }

  const getRoundName = (index: number) => {
    const remaining = matchesPerRound[index] * 2
    if (remaining === 2) return 'Final'
    if (remaining === 4) return 'Semifinal'
    if (remaining === 8) return 'Cuartos'
    if (remaining === 16) return 'Octavos'
    return `1/${remaining}`
  }

  const getTeamName = (index: number) => {
    if (teams[index]) {
      return teams[index].name
    }
    return `Equipo ${index + 1}`
  }

  return (
    <div className='bg-muted rounded-xl p-6 overflow-x-auto'>
      <div className='flex justify-center min-w-max'>
        <div className='flex gap-8 items-center'>
          {matchesPerRound.map((matchCount, roundIndex) => {
            const isLastRound = roundIndex === matchesPerRound.length - 1

            return (
              <div key={roundIndex} className='flex items-center gap-4'>
                <div className='flex flex-col items-center'>
                  <div className='mb-4 px-4 py-2 bg-background rounded-xl shadow-sm border'>
                    <span className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>
                      {getRoundName(roundIndex)}
                    </span>
                  </div>

                  <div
                    className='flex flex-col justify-around h-full'
                    style={{
                      gap: `${Math.pow(2, roundIndex + 1) * 8}px`
                    }}
                  >
                    {Array.from({ length: matchCount }).map(
                      (_, matchIndex) => {
                        const team1Index = matchIndex * 2
                        const team2Index = matchIndex * 2 + 1

                        return (
                          <div key={matchIndex} className='relative'>
                            <div className='bg-background rounded-lg border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow w-40'>
                              <div className='flex items-center justify-between px-3 py-2.5 border-b hover:bg-accent transition-colors group'>
                                <span className='text-sm font-medium group-hover:text-primary truncate'>
                                  {roundIndex === 0
                                    ? getTeamName(team1Index)
                                    : `Ganador ${team1Index + 1}`}
                                </span>
                                <span className='text-xs font-bold text-muted-foreground ml-2'>
                                  -
                                </span>
                              </div>
                              <div className='flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors group'>
                                <span className='text-sm font-medium group-hover:text-primary truncate'>
                                  {roundIndex === 0
                                    ? getTeamName(team2Index)
                                    : `Ganador ${team2Index + 1}`}
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

                {!isLastRound && (
                  <div
                    className='flex flex-col justify-around h-full'
                    style={{
                      gap: `${Math.pow(2, roundIndex + 2) * 8}px`
                    }}
                  >
                    {Array.from({
                      length: Math.ceil(matchCount / 2)
                    }).map((_, lineIndex) => (
                      <div
                        key={lineIndex}
                        className='relative w-8 flex items-center justify-center'
                      >
                        <svg
                          width='32'
                          height={Math.pow(2, roundIndex + 2) * 44}
                          className='overflow-visible'
                        >
                          <line
                            x1='0'
                            y1={
                              Math.pow(2, roundIndex + 1) * 22 -
                              Math.pow(2, roundIndex) * 22
                            }
                            x2='16'
                            y2={
                              Math.pow(2, roundIndex + 1) * 22 -
                              Math.pow(2, roundIndex) * 22
                            }
                            stroke='#D1D5DB'
                            strokeWidth='2'
                          />
                          <line
                            x1='16'
                            y1={
                              Math.pow(2, roundIndex + 1) * 22 -
                              Math.pow(2, roundIndex) * 22
                            }
                            x2='16'
                            y2={
                              Math.pow(2, roundIndex + 1) * 22 +
                              Math.pow(2, roundIndex) * 22
                            }
                            stroke='#D1D5DB'
                            strokeWidth='2'
                          />
                          <line
                            x1='0'
                            y1={
                              Math.pow(2, roundIndex + 1) * 22 +
                              Math.pow(2, roundIndex) * 22
                            }
                            x2='16'
                            y2={
                              Math.pow(2, roundIndex + 1) * 22 +
                              Math.pow(2, roundIndex) * 22
                            }
                            stroke='#D1D5DB'
                            strokeWidth='2'
                          />
                          <line
                            x1='16'
                            y1={Math.pow(2, roundIndex + 1) * 22}
                            x2='32'
                            y2={Math.pow(2, roundIndex + 1) * 22}
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
