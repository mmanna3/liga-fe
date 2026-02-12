import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  GripVertical
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calculateFixtureStats,
  generateAllFixtures,
  generateFixture,
  isValidConfiguration,
  mergeAndResolveInterzonal,
  type FixtureDate,
  type FixtureStats,
  type ZoneInput
} from '../lib/fixture'
import type { TournamentWizardData, Zone } from '../types'
import { SelectorDeZona } from './SelectorDeZona'

interface FixtureTodosContraTodosProps {
  zonesWithTeams: (Zone & { freeDates?: number; interzonalDates?: number })[]
  zoneInputs: ZoneInput[]
  useZoneMode: boolean
  generationKey: number
  fixtureGenerated: boolean
}

export function FixtureTodosContraTodos({
  zonesWithTeams,
  zoneInputs,
  useZoneMode,
  generationKey,
  fixtureGenerated
}: FixtureTodosContraTodosProps) {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const selectedTeams = watch('selectedTeams')
  const freeDates = watch('freeDates')
  const interzonalDates = watch('interzonalDates')
  const phases = watch('phases')
  const currentPhaseIndex = watch('currentPhaseIndex')

  const currentPhase = phases[currentPhaseIndex]
  const rounds = currentPhase?.rounds ?? 'single'
  const teamCount = selectedTeams.length

  const [fixtureDates, setFixtureDates] = useState<FixtureDate[]>([])
  const [zoneFixtures, setZoneFixtures] = useState<
    Array<{ zoneId: string; zoneName: string; dates: FixtureDate[] }>
  >([])
  const [mergedDates, setMergedDates] = useState<FixtureDate[]>([])
  const [stats, setStats] = useState<FixtureStats | null>(null)
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')

  // Auto-select first zone when fixtures are generated
  useEffect(() => {
    if (useZoneMode && zoneFixtures.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zoneFixtures[0].zoneId)
    }
  }, [useZoneMode, zoneFixtures, selectedZoneId])

  // Auto-suggest freeDates for parity
  useEffect(() => {
    if (!useZoneMode && teamCount > 0) {
      if (teamCount % 2 !== 0 && freeDates === 0 && interzonalDates === 0) {
        setValue('freeDates', 1)
      }
    }
  }, [teamCount, useZoneMode])

  const handleGenerate = () => {
    // Clear previous state
    setFixtureDates([])
    setZoneFixtures([])
    setMergedDates([])

    if (useZoneMode) {
      const fixtures = generateAllFixtures(zoneInputs, rounds)
      setZoneFixtures(
        fixtures.map((f) => ({
          zoneId: f.zoneId,
          zoneName: f.zoneName,
          dates: f.dates
        }))
      )
      const merged = mergeAndResolveInterzonal(fixtures)
      setMergedDates(merged)
      setFixtureDates([])

      const firstZoneStats = fixtures[0]?.stats ?? null
      setStats(firstZoneStats)
    } else {
      const teams = selectedTeams.map((t) => ({ id: t.id, name: t.name }))
      const dates = generateFixture(teams, freeDates, interzonalDates, rounds)
      setFixtureDates(dates)
      setZoneFixtures([])
      setMergedDates([])

      const newStats = calculateFixtureStats(
        dates,
        teams,
        freeDates,
        interzonalDates,
        rounds
      )
      setStats(newStats)
    }
    setValue('fixtureGenerated', true, { shouldValidate: true })
  }

  // Expose generate to parent (called via generationKey changes)
  useEffect(() => {
    if (generationKey > 0) {
      const validConfig = useZoneMode
        ? true // parent already validates
        : isValidConfiguration(teamCount, freeDates, interzonalDates)
      if (validConfig) {
        handleGenerate()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationKey])

  // Drag and drop
  const handleDragStart = (entryId: string) => {
    setDraggedEntryId(entryId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (
    targetEntryId: string,
    dateNumber: number,
    inZoneMode?: boolean,
    zoneId?: string
  ) => {
    if (!draggedEntryId || draggedEntryId === targetEntryId) {
      setDraggedEntryId(null)
      return
    }

    const swapEntries = (prev: FixtureDate[]) => {
      const date = prev.find((d) => d.dateNumber === dateNumber)
      if (!date) return prev
      const dragIdx = date.entries.findIndex((e) => e.id === draggedEntryId)
      const targetIdx = date.entries.findIndex((e) => e.id === targetEntryId)
      if (dragIdx < 0 || targetIdx < 0) return prev
      return prev.map((d) => {
        if (d.dateNumber !== dateNumber) return d
        const newEntries = [...d.entries]
        const temp = newEntries[dragIdx]
        newEntries[dragIdx] = newEntries[targetIdx]
        newEntries[targetIdx] = temp
        return { ...d, entries: newEntries }
      })
    }

    if (inZoneMode && zoneId) {
      setZoneFixtures((prev) =>
        prev.map((zf) =>
          zf.zoneId === zoneId ? { ...zf, dates: swapEntries(zf.dates) } : zf
        )
      )
    } else {
      setFixtureDates(swapEntries)
    }

    setDraggedEntryId(null)
  }

  // Compute displayed dates
  const teamIdsInSelectedZone = useZoneMode
    ? new Set(
        zonesWithTeams
          .find((z) => z.id === selectedZoneId)
          ?.teams.map((t) => t.id) ?? []
      )
    : new Set<number>()

  const displayedDates = useZoneMode
    ? (() => {
        const zf = zoneFixtures.find((f) => f.zoneId === selectedZoneId)
        if (!zf) return []
        return zf.dates.map((fd) => {
          const regulars = fd.entries.filter((e) => e.type === 'regular')
          const libres = fd.entries.filter((e) => e.type === 'libre')
          const mergedDate = mergedDates.find(
            (m) => m.dateNumber === fd.dateNumber
          )
          const interzonalsResolved =
            mergedDate?.entries.filter(
              (e) =>
                e.type === 'interzonal' &&
                (e.homeTeamId != null
                  ? teamIdsInSelectedZone.has(e.homeTeamId)
                  : teamIdsInSelectedZone.has(e.awayTeamId!))
            ) ?? []
          const rawInterzonals = fd.entries.filter(
            (e) => e.type === 'interzonal'
          )
          const interzonals =
            interzonalsResolved.length > 0 ? interzonalsResolved : rawInterzonals
          return {
            ...fd,
            entries: [...regulars, ...libres, ...interzonals]
          }
        })
      })()
    : fixtureDates

  const hasFixture = fixtureDates.length > 0 || zoneFixtures.length > 0

  return (
    <>
      {/* Stats */}
      {stats && fixtureGenerated && (
        <StatsPanel stats={stats} />
      )}

      {/* Fixture view */}
      <div key={generationKey} className='bg-background rounded-xl border p-4'>
        {hasFixture ? (
          <div>
            {useZoneMode && zoneFixtures.length > 0 && (
              <SelectorDeZona
                zones={zoneFixtures.map((zf) => ({
                  id: zf.zoneId,
                  name: zf.zoneName,
                  detail: `${zf.dates.length} fechas`
                }))}
                selectedZoneId={selectedZoneId}
                onZoneChange={setSelectedZoneId}
                label='Ver fechas de:'
              />
            )}

            <h4 className='font-semibold mb-4'>
              Fixture generado — {displayedDates.length} fechas
              {useZoneMode && selectedZoneId && (
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  (
                  {
                    zoneFixtures.find((z) => z.zoneId === selectedZoneId)
                      ?.zoneName
                  }
                  )
                </span>
              )}
            </h4>

            {displayedDates.map((fd) => (
              <div key={fd.dateNumber} className='mb-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold'>
                    {fd.dateNumber}
                  </span>
                  <h5 className='font-semibold text-sm'>
                    Fecha {fd.dateNumber}
                  </h5>
                </div>

                <div className='mb-2'>
                  <div className='grid grid-cols-3 items-center gap-3 text-xs font-medium text-muted-foreground px-3'>
                    <div className='text-right'>Local</div>
                    <div className='text-center' />
                    <div className='text-left'>Visitante</div>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  {fd.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        'rounded-lg p-2.5 cursor-move hover:bg-accent transition-colors',
                        entry.type === 'regular' && 'bg-muted',
                        entry.type === 'libre' &&
                          'bg-amber-50 border border-amber-200',
                        entry.type === 'interzonal' &&
                          'bg-blue-50 border border-blue-200'
                      )}
                      draggable
                      onDragStart={() => handleDragStart(entry.id)}
                      onDragOver={handleDragOver}
                      onDrop={() =>
                        handleDrop(
                          entry.id,
                          fd.dateNumber,
                          useZoneMode,
                          selectedZoneId
                        )
                      }
                    >
                      <div className='flex items-center gap-2'>
                        <GripVertical className='w-4 h-4 text-muted-foreground shrink-0' />
                        <div className='grid grid-cols-3 items-center gap-3 text-sm flex-1'>
                          <div className='text-right'>
                            <span
                              className={cn(
                                'font-medium',
                                entry.home === 'INTERZONAL' &&
                                  'text-blue-700 italic'
                              )}
                            >
                              {entry.home}
                            </span>
                          </div>
                          <div className='text-center'>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium border',
                                entry.type === 'regular' &&
                                  'bg-background text-muted-foreground',
                                entry.type === 'libre' &&
                                  'bg-amber-100 text-amber-700 border-amber-300',
                                entry.type === 'interzonal' &&
                                  'bg-blue-100 text-blue-700 border-blue-300'
                              )}
                            >
                              vs
                            </span>
                          </div>
                          <div className='text-left'>
                            <span
                              className={cn(
                                'font-medium',
                                entry.away === 'LIBRE' &&
                                  'text-amber-700 italic',
                                entry.away === 'INTERZONAL' &&
                                  'text-blue-700 italic'
                              )}
                            >
                              {entry.away}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <CalendarIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
            <p className='text-sm'>
              Hacé clic en &quot;Generar fixture&quot; para crear el calendario
              de jornadas
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function StatsPanel({ stats }: { stats: FixtureStats }) {
  return (
    <div className='p-3 bg-muted rounded-lg space-y-2'>
      <p className='text-sm font-medium'>
        Fixture generado — {stats.totalDates} fechas
      </p>
      <p className='text-sm text-muted-foreground'>
        Cada equipo juega{' '}
        <strong className='text-foreground'>
          {stats.expectedHomeGames}{' '}
          {stats.expectedHomeGames === 1 ? 'partido' : 'partidos'} de local
        </strong>{' '}
        y{' '}
        <strong className='text-foreground'>
          {stats.expectedAwayGames} de visitante
        </strong>
        .
      </p>
      {stats.exceptions.length > 0 && (
        <div className='space-y-1'>
          <p className='text-xs font-medium text-amber-700 flex items-center gap-1'>
            <AlertTriangle className='w-3 h-3' />
            Excepciones en la distribución:
          </p>
          {stats.exceptions.map((ex, i) => (
            <p key={i} className='text-xs text-amber-700 pl-4'>
              • {ex}
            </p>
          ))}
        </div>
      )}
      {stats.exceptions.length === 0 && (
        <p className='text-xs text-muted-foreground'>
          Distribución equilibrada. Sin excepciones.
        </p>
      )}
    </div>
  )
}
