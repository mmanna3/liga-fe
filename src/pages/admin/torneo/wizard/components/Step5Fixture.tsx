import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  GripVertical,
  Info,
  Wand2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calculateFixtureStats,
  calculateTotalDates,
  calculateTotalDatesForZones,
  generateAllFixtures,
  generateFixture,
  isValidConfiguration,
  mergeAndResolveInterzonal,
  validateInterzonalPairing,
  validateZones,
  type FixtureDate,
  type FixtureStats
} from '../lib/fixture'
import type { TournamentWizardData, Zone } from '../types'
import { BracketView } from './BracketView'
import { MiniResumen } from './MiniResumen'

export function Step5Fixture() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<TournamentWizardData>()

  const [fixtureDates, setFixtureDates] = useState<FixtureDate[]>([])
  const [zoneFixtures, setZoneFixtures] = useState<
    Array<{ zoneId: string; zoneName: string; dates: FixtureDate[] }>
  >([])
  const [mergedDates, setMergedDates] = useState<FixtureDate[]>([])
  const [stats, setStats] = useState<FixtureStats | null>(null)
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('')
  const [selectedEliminationZoneId, setSelectedEliminationZoneId] =
    useState<string>('')

  const data = {
    phases: watch('phases'),
    currentPhaseIndex: watch('currentPhaseIndex'),
    selectedTeams: watch('selectedTeams'),
    freeDates: watch('freeDates'),
    interzonalDates: watch('interzonalDates'),
    zonesCount: watch('zonesCount'),
    preventClubClash: watch('preventClubClash'),
    fixtureGenerated: watch('fixtureGenerated'),
    zones: watch('zones') as (Zone & { freeDates?: number })[]
  }

  const currentPhase = data.phases[data.currentPhaseIndex]
  const isElimination = currentPhase?.format === 'elimination'
  const isAllVsAll = currentPhase?.format === 'all-vs-all'
  const rounds = currentPhase?.rounds ?? 'single'
  const teamCount = data.selectedTeams.length

  const zonesWithTeams = data.zones.filter((z) => z.teams.length > 0)
  const useZoneMode = isAllVsAll && zonesWithTeams.length > 0
  const hasMultipleZones = zonesWithTeams.length > 1

  const zoneInputs = zonesWithTeams.map((z) => ({
    id: z.id,
    name: z.name,
    teams: z.teams.map((t) => ({ id: t.id, name: t.name })),
    freeDates: z.freeDates ?? 0,
    interzonalDates: z.interzonalDates ?? 0
  }))

  const zoneValidations = useZoneMode ? validateZones(zoneInputs) : []
  const interzonalPairing = useZoneMode
    ? validateInterzonalPairing(zoneInputs)
    : { isValid: true, message: '' }

  const validConfig = useZoneMode
    ? zoneValidations.every((v) => v.isValid) && interzonalPairing.isValid
    : isValidConfiguration(teamCount, data.freeDates, data.interzonalDates)

  const totalDates = isAllVsAll
    ? useZoneMode
      ? calculateTotalDatesForZones(zoneInputs, rounds)
      : calculateTotalDates(
          teamCount,
          data.freeDates,
          data.interzonalDates,
          rounds
        )
    : 0

  useEffect(() => {
    if (useZoneMode && zoneFixtures.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zoneFixtures[0].zoneId)
    }
  }, [useZoneMode, zoneFixtures, selectedZoneId])

  useEffect(() => {
    if (isElimination && zonesWithTeams.length > 0) {
      const exists = zonesWithTeams.some((z) => z.id === selectedEliminationZoneId)
      if (!selectedEliminationZoneId || !exists) {
        setSelectedEliminationZoneId(zonesWithTeams[0].id)
      }
    }
  }, [isElimination, zonesWithTeams, selectedEliminationZoneId])

  useEffect(() => {
    if (isAllVsAll && !useZoneMode && teamCount > 0 && teamCount % 2 !== 0) {
      const currentFree = data.freeDates
      const currentIz = data.interzonalDates
      if (currentFree === 0 && currentIz === 0) {
        setValue('freeDates', 1)
      }
    }
  }, [teamCount, isAllVsAll, useZoneMode])


  const handleGenerate = () => {
    if (isElimination) {
      setValue('fixtureGenerated', true)
      return
    }

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
      const teams = data.selectedTeams.map((t) => ({ id: t.id, name: t.name }))
      const dates = generateFixture(
        teams,
        data.freeDates,
        data.interzonalDates,
        rounds
      )
      setFixtureDates(dates)
      setZoneFixtures([])
      setMergedDates([])

      const newStats = calculateFixtureStats(
        dates,
        teams,
        data.freeDates,
        data.interzonalDates,
        rounds
      )
      setStats(newStats)
    }
    setValue('fixtureGenerated', true)
  }

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

  const teamIdsInSelectedZone = useZoneMode
    ? new Set(
        zonesWithTeams.find((z) => z.id === selectedZoneId)?.teams.map((t) => t.id) ?? []
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
          const rawInterzonals = fd.entries.filter((e) => e.type === 'interzonal')
          const interzonals =
            interzonalsResolved.length > 0 ? interzonalsResolved : rawInterzonals
          return {
            ...fd,
            entries: [...regulars, ...libres, ...interzonals]
          }
        })
      })()
    : fixtureDates

  return (
    <div className='space-y-4'>
      <MiniResumen />

      {isAllVsAll && (
        <div className='space-y-4'>
          {/* Inputs: freeDates por zona cuando hay zonas; interzonal a nivel fase si N>1 */}
          {useZoneMode ? (
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium mb-2'>
                  Fechas libre por equipo (por zona)
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {zonesWithTeams.map((zone) => (
                    <div key={zone.id}>
                      <Label
                        htmlFor={`freeDates-${zone.id}`}
                        className='block mb-1 text-xs'
                      >
                        {zone.name}
                      </Label>
                      <Input
                        id={`freeDates-${zone.id}`}
                        type='number'
                        min={0}
                        value={zone.freeDates ?? 0}
                        onChange={(e) => {
                          const v = Math.max(0, parseInt(e.target.value) || 0)
                          setValue(
                            'zones',
                            data.zones.map((z) =>
                              z.id === zone.id ? { ...z, freeDates: v } : z
                            )
                          )
                          setValue('fixtureGenerated', false)
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Cada zona puede tener distinta cantidad de fechas libres
                </p>
              </div>

              {hasMultipleZones && (
                <div>
                  <p className='text-sm font-medium mb-2'>
                    Fechas interzonal por equipo (por zona)
                  </p>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Todas las zonas deben tener el mismo valor para que cada
                    equipo tenga rival en cada fecha.
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                    {zonesWithTeams.map((zone) => (
                      <div key={zone.id}>
                        <Label
                          htmlFor={`interzonalDates-${zone.id}`}
                          className='block mb-1 text-xs'
                        >
                          {zone.name}
                        </Label>
                        <Input
                          id={`interzonalDates-${zone.id}`}
                          type='number'
                          min={0}
                          value={zone.interzonalDates ?? 0}
                          onChange={(e) => {
                            const v = Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            )
                            setValue(
                              'zones',
                              data.zones.map((z) =>
                                z.id === zone.id
                                  ? { ...z, interzonalDates: v }
                                  : z
                              )
                            )
                            setValue('fixtureGenerated', false)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='freeDates' className='block mb-1.5'>
                  Fechas libre por equipo
                </Label>
                <Input
                  id='freeDates'
                  type='number'
                  min={0}
                  value={data.freeDates}
                  onChange={(e) => {
                    const v = Math.max(0, parseInt(e.target.value) || 0)
                    setValue('freeDates', v)
                    setValue('fixtureGenerated', false)
                  }}
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Cada equipo descansa esta cantidad de jornadas
                </p>
              </div>

              <div>
                <Label htmlFor='interzonalDates' className='block mb-1.5'>
                  Fechas interzonal por equipo
                </Label>
                <Input
                  id='interzonalDates'
                  type='number'
                  min={0}
                  value={data.interzonalDates}
                  onChange={(e) => {
                    const v = Math.max(0, parseInt(e.target.value) || 0)
                    setValue('interzonalDates', v)
                    setValue('fixtureGenerated', false)
                  }}
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Cada equipo juega interzonal esta cantidad de jornadas
                </p>
              </div>
            </div>
          )}

          {/* Resumen de jornadas y validación de paridad */}
          <div
            className={cn(
              'p-3 rounded-lg border',
              validConfig
                ? 'bg-muted border-transparent'
                : 'bg-destructive/10 border-destructive/30'
            )}
          >
            {validConfig ? (
              <div className='space-y-1'>
                {useZoneMode ? (
                  <>
                    {zoneValidations.map((zv) => {
                      const z = zonesWithTeams.find((x) => x.id === zv.zoneId)
                      const free = z?.freeDates ?? 0
                      const iz = z?.interzonalDates ?? 0
                      return (
                        <p key={zv.zoneId} className='text-sm'>
                          <strong>
                            {zv.zoneName}: {zv.teamCount} equipos + {free}{' '}
                            libre
                            {hasMultipleZones && iz > 0 &&
                              ` + ${iz} interzonal`}{' '}
                            = {zv.totalParticipants} participantes
                          </strong>
                        </p>
                      )
                    })}
                    <p className='text-sm text-muted-foreground'>
                      Cada zona tendrá hasta{' '}
                      <strong className='text-foreground'>
                        {totalDates} fechas
                      </strong>{' '}
                      ({rounds === 'double' ? 'ida y vuelta' : 'solo ida'}).
                      {hasMultipleZones &&
                        zoneInputs.some((z) => z.interzonalDates > 0) &&
                        ' Los partidos interzonales cruzan equipos entre zonas.'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className='text-sm'>
                      <strong>
                        {teamCount} equipos + {data.freeDates} libre +{' '}
                        {data.interzonalDates} interzonal ={' '}
                        {teamCount + data.freeDates + data.interzonalDates}{' '}
                        participantes
                      </strong>
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      El torneo tendrá{' '}
                      <strong className='text-foreground'>
                        {totalDates} jornadas
                      </strong>{' '}
                      ({rounds === 'double' ? 'ida y vuelta' : 'solo ida'}).
                    </p>
                  </>
                )}
                {!useZoneMode && data.freeDates > 0 && (
                  <p className='text-xs text-muted-foreground flex items-center gap-1'>
                    <Info className='w-3 h-3 shrink-0' />
                    Cada equipo descansa {data.freeDates} jornada
                    {data.freeDates !== 1 ? 's' : ''}.
                  </p>
                )}
                {!useZoneMode && data.interzonalDates > 0 && (
                  <p className='text-xs text-muted-foreground flex items-center gap-1'>
                    <Info className='w-3 h-3 shrink-0' />
                    Cada equipo juega {data.interzonalDates} jornada
                    {data.interzonalDates !== 1 ? 's' : ''} interzonal.
                  </p>
                )}
                {useZoneMode &&
                  hasMultipleZones &&
                  zoneInputs.some((z) => z.interzonalDates > 0) &&
                  interzonalPairing.isValid && (
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      <Info className='w-3 h-3 shrink-0' />
                      Todas las zonas tienen la misma cantidad interzonal:
                      emparejamiento correcto.
                    </p>
                  )}
              </div>
            ) : (
              <div className='flex items-start gap-2'>
                <AlertTriangle className='w-4 h-4 text-destructive shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-destructive'>
                    La cantidad total de participantes debe ser par en cada zona
                  </p>
                  <p className='text-xs text-destructive/80 mt-0.5'>
                    {useZoneMode
                      ? !interzonalPairing.isValid
                        ? interzonalPairing.message
                        : zoneValidations
                            .filter((v) => !v.isValid)
                            .map((v) => {
                              const z = zonesWithTeams.find(
                                (x) => x.id === v.zoneId
                              )
                              const free = z?.freeDates ?? 0
                              const iz = z?.interzonalDates ?? 0
                              return `${v.zoneName}: ${v.teamCount} + ${free} libre${hasMultipleZones && iz > 0 ? ` + ${iz} interzonal` : ''} = ${v.totalParticipants} (impar). `
                            })
                            .join(' ') || 'Ajustá libre o interzonal por zona.'
                      : `Actualmente: ${teamCount} equipos + ${data.freeDates} libre + ${data.interzonalDates} interzonal = ${teamCount + data.freeDates + data.interzonalDates} (impar). Ajustá la cantidad de fechas libre o interzonal.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón generar */}
      <Button
        type='button'
        onClick={handleGenerate}
        className='w-full'
        disabled={isAllVsAll && !validConfig}
      >
        <Wand2 className='w-5 h-5' />
        {data.fixtureGenerated ? 'Regenerar fixture' : 'Generar fixture'}
      </Button>

      {errors.fixtureGenerated && (
        <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg'>
          <p className='text-sm text-destructive'>
            {errors.fixtureGenerated.message}
          </p>
        </div>
      )}

      {/* Estadísticas */}
      {stats && data.fixtureGenerated && isAllVsAll && (
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
      )}

      {/* Vista del fixture */}
      <div className='bg-background rounded-xl border p-4'>
        {isElimination && data.selectedTeams.length > 0 ? (
          <div>
            <h4 className='font-semibold mb-4 flex items-center gap-2'>
              <CalendarIcon className='w-5 h-5 text-primary' />
              Llaves de eliminación directa
            </h4>
            {zonesWithTeams.length > 0 ? (
              <>
                <div className='mb-4'>
                  <Label className='text-xs text-muted-foreground block mb-2'>
                    Ver llave de:
                  </Label>
                  <Select
                    value={selectedEliminationZoneId}
                    onValueChange={setSelectedEliminationZoneId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar zona' />
                    </SelectTrigger>
                    <SelectContent>
                      {zonesWithTeams.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} — {zone.teams.length} equipos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedEliminationZoneId && (
                  <BracketView
                    teamSlots={
                      zonesWithTeams.find((z) => z.id === selectedEliminationZoneId)
                        ?.teams.length ?? 0
                    }
                    teams={
                      zonesWithTeams.find((z) => z.id === selectedEliminationZoneId)
                        ?.teams ?? []
                    }
                    zones={data.zones}
                  />
                )}
              </>
            ) : (
              <BracketView
                teamSlots={data.selectedTeams.length}
                teams={data.selectedTeams}
                zones={data.zones}
              />
            )}
          </div>
        ) : isAllVsAll &&
          (fixtureDates.length > 0 || zoneFixtures.length > 0) ? (
          <div>
            {useZoneMode && zoneFixtures.length > 0 && (
              <div className='mb-4'>
                <Label className='text-xs text-muted-foreground block mb-2'>
                  Ver fechas de:
                </Label>
                <Select
                  value={selectedZoneId}
                  onValueChange={setSelectedZoneId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Seleccionar zona' />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneFixtures.map((zf) => (
                      <SelectItem key={zf.zoneId} value={zf.zoneId}>
                        {zf.zoneName} — {zf.dates.length} fechas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <h4 className='font-semibold mb-4'>
              Fixture generado — {displayedDates.length} fechas
              {useZoneMode && selectedZoneId && (
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  ({zoneFixtures.find((z) => z.zoneId === selectedZoneId)?.zoneName})
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
    </div>
  )
}
