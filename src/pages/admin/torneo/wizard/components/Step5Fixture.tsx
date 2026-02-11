import { useState, useEffect } from 'react'
import { Wand2, Calendar as CalendarIcon, GripVertical } from 'lucide-react'
import type { TournamentWizardData, WizardTeam } from '../types'
import { BracketView } from './BracketView'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Match {
  id: string
  team1: WizardTeam | null
  team2: WizardTeam | null
  round?: number
  date?: number
  realDate?: Date
  home?: WizardTeam | null
  away?: WizardTeam | null
}

interface DateConfig {
  dateNumber: number
  realDate?: Date
}

interface Step5FixtureProps {
  data: TournamentWizardData
  updateData: (field: Partial<TournamentWizardData>) => void
}

export function Step5Fixture({ data, updateData }: Step5FixtureProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [dateConfigs, setDateConfigs] = useState<DateConfig[]>([])
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)

  const currentPhase = data.phases[data.currentPhaseIndex]
  const isElimination = currentPhase?.format === 'elimination'
  const isAllVsAll = currentPhase?.format === 'all-vs-all'

  useEffect(() => {
    if (data.numberOfDates === 0 && isAllVsAll) {
      updateData({ numberOfDates: 14 })
    }
  }, [isAllVsAll])

  const handleAutogenerate = () => {
    if (isElimination) {
      autogenerateElimination()
    } else {
      autogenerateAllVsAll()
    }
    updateData({ fixtureGenerated: true })
  }

  const autogenerateElimination = () => {
    const teamCount = data.selectedTeams.length
    const rounds = Math.ceil(Math.log2(teamCount))
    const matchesPerRound = Math.pow(2, rounds - 1)

    const newMatches: Match[] = []
    for (let i = 0; i < matchesPerRound; i++) {
      const team1Index = i * 2
      const team2Index = i * 2 + 1

      newMatches.push({
        id: `match-${i}`,
        team1: data.selectedTeams[team1Index] ?? null,
        team2: data.selectedTeams[team2Index] ?? null,
        round: 1
      })
    }
    setMatches(newMatches)
  }

  const autogenerateAllVsAll = () => {
    const newMatches: Match[] = []
    let teams = [...data.selectedTeams]

    teams = teams.sort(() => Math.random() - 0.5)

    const n = teams.length
    const isDouble = currentPhase?.rounds === 'double'

    const rounds = n % 2 === 0 ? n - 1 : n
    const matchesPerRound = Math.floor(n / 2)

    let dateCounter = 1
    const newDateConfigs: DateConfig[] = []

    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const home = (round + i) % (n - 1)
        const away = (n - 1 - i + round) % (n - 1)

        const homeIndex = home === n - 1 ? n - 1 : home
        const awayIndex = away === n - 1 ? n - 1 : away

        if (homeIndex < teams.length && awayIndex < teams.length) {
          const homeTeam = teams[homeIndex]
          const awayTeam = teams[awayIndex]

          if (
            data.preventClubClash &&
            homeTeam &&
            awayTeam &&
            homeTeam.club === awayTeam.club
          ) {
            continue
          }

          newMatches.push({
            id: `match-r${round}-${i}`,
            team1: homeTeam,
            team2: awayTeam,
            home: homeTeam,
            away: awayTeam,
            date: dateCounter
          })
        }
      }
      newDateConfigs.push({ dateNumber: dateCounter })
      dateCounter++

      if (isDouble && round === rounds - 1) {
        for (let round2 = 0; round2 < rounds; round2++) {
          for (let i = 0; i < matchesPerRound; i++) {
            const home = (round2 + i) % (n - 1)
            const away = (n - 1 - i + round2) % (n - 1)

            const homeIndex = home === n - 1 ? n - 1 : home
            const awayIndex = away === n - 1 ? n - 1 : away

            if (homeIndex < teams.length && awayIndex < teams.length) {
              const homeTeam = teams[awayIndex]
              const awayTeam = teams[homeIndex]

              if (
                data.preventClubClash &&
                homeTeam &&
                awayTeam &&
                homeTeam.club === awayTeam.club
              ) {
                continue
              }

              newMatches.push({
                id: `match-return-r${round2}-${i}`,
                team1: homeTeam,
                team2: awayTeam,
                home: homeTeam,
                away: awayTeam,
                date: dateCounter
              })
            }
          }
          newDateConfigs.push({ dateNumber: dateCounter })
          dateCounter++
        }
      }
    }

    setMatches(newMatches)
    setDateConfigs(newDateConfigs)
  }

  const handleDragStart = (match: Match) => {
    setDraggedMatch(match)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetMatch: Match) => {
    if (!draggedMatch || draggedMatch.id === targetMatch.id) {
      setDraggedMatch(null)
      return
    }

    const newMatches = matches.map((m) => {
      if (m.id === draggedMatch.id) {
        return {
          ...m,
          team1: targetMatch.team1,
          team2: targetMatch.team2,
          home: targetMatch.home,
          away: targetMatch.away
        }
      }
      if (m.id === targetMatch.id) {
        return {
          ...m,
          team1: draggedMatch.team1,
          team2: draggedMatch.team2,
          home: draggedMatch.home,
          away: draggedMatch.away
        }
      }
      return m
    })

    setMatches(newMatches)
    setDraggedMatch(null)
  }

  const updateDateConfig = (dateNumber: number, realDate: Date) => {
    const newDateConfigs = dateConfigs.map((dc) =>
      dc.dateNumber === dateNumber ? { ...dc, realDate } : dc
    )
    setDateConfigs(newDateConfigs)
  }

  const calculateStats = () => {
    if (!data.selectedTeams.length) {
      return {
        homeGames: 0,
        awayGames: 0,
        freeCount: 0,
        interzonalCount: 0
      }
    }

    const teamCount = data.selectedTeams.length
    const isDouble = currentPhase?.rounds === 'double'

    if (isAllVsAll) {
      const opponents = teamCount - 1
      const homeGames = isDouble ? opponents : Math.floor(opponents / 2)
      const awayGames = isDouble ? opponents : Math.ceil(opponents / 2)
      const freeCount =
        data.hasFreeBye && teamCount % 2 !== 0
          ? isDouble
            ? 2
            : 1
          : 0
      const interzonalCount =
        data.hasInterzonal && data.zonesCount > 1 ? data.zonesCount - 1 : 0

      return { homeGames, awayGames, freeCount, interzonalCount }
    }

    return { homeGames: 0, awayGames: 0, freeCount: 0, interzonalCount: 0 }
  }

  const stats = calculateStats()

  return (
    <div className='space-y-4'>
      <div className='bg-muted rounded-lg p-4'>
        <h3 className='font-semibold text-foreground mb-1'>
          {data.name || 'Nombre del torneo'}
        </h3>
        <p className='text-sm text-muted-foreground'>
          {currentPhase && (
            <>
              Fase:{' '}
              <span className='font-semibold text-foreground'>
                {currentPhase.name}
              </span>
              {' - '}
              <span>
                {isElimination
                  ? 'Eliminación directa'
                  : 'Todos contra todos'}
              </span>
              {' - '}
              <span className='font-semibold'>
                {data.selectedTeams.length} equipos
              </span>
            </>
          )}
        </p>
      </div>

      <div>
        <h3 className='text-base font-semibold mb-1'>Fixture</h3>
        <p className='text-muted-foreground text-sm mb-4'>
          Genera y visualiza el fixture del torneo
        </p>

        <div className='space-y-3 mb-4'>
          {isAllVsAll && (
            <div>
              <Label className='mb-1.5'>Cantidad de fechas</Label>
              <Input
                type='number'
                value={data.numberOfDates}
                onChange={(e) =>
                  updateData({
                    numberOfDates: parseInt(e.target.value, 10) || 0
                  })
                }
                min={1}
                placeholder='Ej: 14'
              />
            </div>
          )}

          <div className='flex flex-wrap gap-3'>
            <div className='flex items-center gap-2 px-3 py-2 bg-muted rounded-lg'>
              <Checkbox
                id='free-bye'
                checked={data.hasFreeBye}
                onCheckedChange={(checked) =>
                  updateData({ hasFreeBye: checked === true })
                }
              />
              <Label htmlFor='free-bye' className='cursor-pointer'>
                Hay equipo libre
              </Label>
            </div>

            {isAllVsAll && (
              <>
                <div className='flex items-center gap-2 px-3 py-2 bg-muted rounded-lg'>
                  <Checkbox
                    id='interzonal'
                    checked={data.hasInterzonal}
                    onCheckedChange={(checked) =>
                      updateData({ hasInterzonal: checked === true })
                    }
                    disabled={data.zonesCount <= 1}
                  />
                  <Label
                    htmlFor='interzonal'
                    className={cn(
                      'cursor-pointer',
                      data.zonesCount <= 1 && 'text-muted-foreground'
                    )}
                  >
                    Hay interzonal
                  </Label>
                  {data.zonesCount <= 1 && (
                    <span className='text-xs text-muted-foreground'>
                      (requiere 2+ zonas)
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-2 px-3 py-2 bg-muted rounded-lg'>
                  <Checkbox
                    id='prevent-club-clash'
                    checked={data.preventClubClash}
                    onCheckedChange={(checked) =>
                      updateData({ preventClubClash: checked === true })
                    }
                  />
                  <Label
                    htmlFor='prevent-club-clash'
                    className='cursor-pointer'
                  >
                    Dos equipos del mismo club no pueden jugar juntos
                  </Label>
                </div>
              </>
            )}
          </div>

          <Button
            type='button'
            onClick={handleAutogenerate}
            className='w-full'
          >
            <Wand2 className='w-5 h-5' />
            {data.fixtureGenerated ? 'Regenerar fixture' : 'Generar fixture'}
          </Button>

          {data.selectedTeams.length > 0 && isAllVsAll && (
            <div className='p-3 bg-muted rounded-lg'>
              <p className='text-sm text-muted-foreground'>
                Cada equipo va a jugar{' '}
                <strong className='text-foreground'>
                  {stats.homeGames} partidos de local
                </strong>{' '}
                y{' '}
                <strong className='text-foreground'>
                  {stats.awayGames} de visitante
                </strong>
                {stats.freeCount > 0 && (
                  <>
                    . Además, va a quedar libre{' '}
                    <strong className='text-foreground'>
                      {stats.freeCount}{' '}
                      {stats.freeCount === 1 ? 'fecha' : 'fechas'}
                    </strong>
                  </>
                )}
                {stats.interzonalCount > 0 && (
                  <>
                    {' '}
                    y va a jugar un partido interzonal{' '}
                    <strong className='text-foreground'>
                      {stats.interzonalCount}{' '}
                      {stats.interzonalCount === 1 ? 'fecha' : 'fechas'}
                    </strong>
                  </>
                )}
                .
              </p>
            </div>
          )}
        </div>

        <div className='bg-background rounded-xl border p-4'>
          {isElimination && data.selectedTeams.length > 0 ? (
            <div>
              <h4 className='font-semibold mb-4 flex items-center gap-2'>
                <CalendarIcon className='w-5 h-5 text-primary' />
                Llaves de eliminación directa
              </h4>
              <BracketView
                teamSlots={data.selectedTeams.length}
                teams={data.selectedTeams}
                zones={data.zones}
              />
            </div>
          ) : isAllVsAll && matches.length > 0 ? (
            <div>
              <h4 className='font-semibold mb-4'>
                Fixture generado - {matches.length} partidos
              </h4>

              {Array.from(new Set(matches.map((m) => m.date)))
                .filter((d): d is number => d != null)
                .sort((a, b) => a - b)
                .map((dateNum) => {
                  const dateMatches = matches.filter(
                    (m) => m.date === dateNum
                  )
                  const dateConfig = dateConfigs.find(
                    (dc) => dc.dateNumber === dateNum
                  )

                  return (
                    <div key={dateNum} className='mb-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <h5 className='font-semibold text-sm flex items-center gap-2'>
                          <span className='w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs'>
                            {dateNum}
                          </span>
                          Fecha {dateNum}
                        </h5>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button type='button' variant='outline' size='sm'>
                              <CalendarIcon className='w-4 h-4' />
                              {dateConfig?.realDate
                                ? format(dateConfig.realDate, 'dd/MM/yy', {
                                    locale: es
                                  })
                                : 'Asignar fecha'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-auto p-0'
                            align='end'
                          >
                            <Calendar
                              mode='single'
                              selected={dateConfig?.realDate}
                              onSelect={(date) =>
                                date && updateDateConfig(dateNum, date)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className='mb-2'>
                        <div className='grid grid-cols-3 items-center gap-3 text-xs font-medium text-muted-foreground px-3'>
                          <div className='text-right'>Local</div>
                          <div className='text-center' />
                          <div className='text-left'>Visitante</div>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        {dateMatches.map((match) => (
                          <div
                            key={match.id}
                            className='bg-muted rounded-lg p-3 cursor-move hover:bg-accent transition-colors'
                            draggable
                            onDragStart={() => handleDragStart(match)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(match)}
                          >
                            <div className='flex items-center gap-2'>
                              <GripVertical className='w-4 h-4 text-muted-foreground' />
                              <div className='grid grid-cols-3 items-center gap-3 text-sm flex-1'>
                                <div className='text-right'>
                                  <span className='font-medium'>
                                    {match.home?.name ?? match.team1?.name}
                                  </span>
                                </div>
                                <div className='text-center'>
                                  <span className='px-3 py-1 bg-background rounded text-xs font-medium text-muted-foreground border'>
                                    vs
                                  </span>
                                </div>
                                <div className='text-left'>
                                  <span className='font-medium'>
                                    {match.away?.name ?? match.team2?.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

              {currentPhase?.format === 'all-vs-all' && (
                <div className='mt-6 pt-6 border-t'>
                  <h4 className='font-semibold mb-4'>Vista de llaves</h4>
                  <BracketView
                    teamSlots={data.selectedTeams.length}
                    teams={data.selectedTeams}
                    zones={data.zones}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <CalendarIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
              <p className='text-sm'>
                Haz clic en &quot;Generar fixture&quot; para crear el
                calendario de partidos
              </p>
            </div>
          )}
        </div>

        <div className='p-3 bg-muted rounded-lg mt-4'>
          <p className='text-sm text-muted-foreground'>
            El fixture se genera automáticamente considerando{' '}
            {isElimination
              ? 'las llaves de eliminación'
              : 'que todos los equipos jueguen entre sí'}
            .
          </p>
        </div>
      </div>
    </div>
  )
}
