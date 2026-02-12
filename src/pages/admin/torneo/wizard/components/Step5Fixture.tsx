import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calculateTotalDates,
  calculateTotalDatesForZones,
  isValidConfiguration,
  isValidForElimination,
  validateInterzonalPairing,
  validateZones,
  type ZoneInput
} from '../lib/fixture'
import type { TournamentWizardData, Zone } from '../types'
import { FixtureEliminacionDirecta } from './FixtureEliminacionDirecta'
import { FixtureTodosContraTodos } from './FixtureTodosContraTodos'
import { MiniResumen } from './MiniResumen'
import { PanelValidacion } from './PanelValidacion'
import { TablaConfigZonas } from './TablaConfigZonas'

export function Step5Fixture() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<TournamentWizardData>()

  const [generationKey, setGenerationKey] = useState(0)
  const [bracketParticipants, setBracketParticipants] = useState<
    Array<{ id: number; name: string; club: string; tournament: string; zone: string }> | null
  >(null)
  const [bracketParticipantsByZone, setBracketParticipantsByZone] = useState<
    Record<string, Array<{ id: number; name: string; club: string; tournament: string; zone: string }>>
  >({})

  const phases = watch('phases')
  const currentPhaseIndex = watch('currentPhaseIndex')
  const selectedTeams = watch('selectedTeams')
  const freeDates = watch('freeDates')
  const interzonalDates = watch('interzonalDates')
  const fixtureGenerated = watch('fixtureGenerated')
  const zones = watch('zones') as (Zone & { freeDates?: number })[]

  const currentPhase = phases[currentPhaseIndex]
  const isElimination = currentPhase?.format === 'elimination'
  const isAllVsAll = currentPhase?.format === 'all-vs-all'
  const rounds = currentPhase?.rounds ?? 'single'
  const teamCount = selectedTeams.length

  const zonesWithTeams = zones.filter((z) => z.teams.length > 0)
  const useZoneMode =
    (isAllVsAll || isElimination) && zonesWithTeams.length > 0
  const hasMultipleZones = zonesWithTeams.length > 1

  const zoneInputs: ZoneInput[] = zonesWithTeams.map((z) => ({
    id: z.id,
    name: z.name,
    teams: z.teams.map((t) => ({ id: t.id, name: t.name })),
    freeDates: z.freeDates ?? 0,
    interzonalDates: z.interzonalDates ?? 0
  }))

  const zoneValidations = useZoneMode
    ? validateZones(zoneInputs, isElimination ? 'elimination' : 'all-vs-all')
    : []
  const interzonalPairing = useZoneMode
    ? validateInterzonalPairing(zoneInputs)
    : { isValid: true, message: '' }

  const validConfig = useZoneMode
    ? zoneValidations.every((v) => v.isValid) && interzonalPairing.isValid
    : isElimination
      ? isValidForElimination(teamCount, freeDates, interzonalDates)
      : isValidConfiguration(teamCount, freeDates, interzonalDates)

  const totalDates = isAllVsAll
    ? useZoneMode
      ? calculateTotalDatesForZones(zoneInputs, rounds)
      : calculateTotalDates(teamCount, freeDates, interzonalDates, rounds)
    : 0

  useEffect(() => {
    if (!fixtureGenerated) {
      setBracketParticipants(null)
      setBracketParticipantsByZone({})
    }
  }, [fixtureGenerated])

  const shuffle = <T,>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5)

  const LIBRE_PLACEHOLDER = (i: number) => ({
    id: -1 - i,
    name: 'LIBRE',
    club: '',
    tournament: '',
    zone: ''
  })
  const INTERZONAL_PLACEHOLDER = (i: number) => ({
    id: -100 - i,
    name: 'INTERZONAL',
    club: '',
    tournament: '',
    zone: ''
  })

  /**
   * Construye participantes para la llave de eliminación directa.
   * Regla: LIBRE e INTERZONAL nunca pueden enfrentarse entre sí ni con otro placeholder.
   * Cada placeholder solo se empareja con un equipo real (bye).
   */
  const buildParticipants = (
    teams: { id: number; name: string; club: string; tournament: string; zone: string }[],
    free: number,
    interzonal: number
  ) => {
    const numPlaceholders = free + interzonal
    const total = teams.length + numPlaceholders
    const numPairs = total / 2

    const shuffledTeams = shuffle([...teams])
    const placeholders = shuffle([
      ...Array.from({ length: free }, (_, i) => LIBRE_PLACEHOLDER(i)),
      ...Array.from({ length: interzonal }, (_, i) =>
        INTERZONAL_PLACEHOLDER(i)
      )
    ])

    const pairIndicesWithPlaceholder = shuffle(
      Array.from({ length: numPairs }, (_, i) => i)
    ).slice(0, numPlaceholders)

    const pairHasPlaceholder = new Set(pairIndicesWithPlaceholder)
    type Participant = { id: number; name: string; club: string; tournament: string; zone: string }
    const result: Participant[] = []
    let teamIdx = 0
    let placeholderIdx = 0

    for (let p = 0; p < numPairs; p++) {
      if (pairHasPlaceholder.has(p)) {
        result.push(shuffledTeams[teamIdx++])
        result.push(placeholders[placeholderIdx++])
      } else {
        result.push(shuffledTeams[teamIdx++])
        result.push(shuffledTeams[teamIdx++])
      }
    }

    return result
  }

  const handleGenerate = () => {
    setGenerationKey((k) => k + 1)

    if (isElimination) {
      if (useZoneMode) {
        const byZone: Record<
          string,
          Array<{ id: number; name: string; club: string; tournament: string; zone: string }>
        > = {}
        for (const z of zonesWithTeams) {
          const free = z.freeDates ?? 0
          const interzonal = z.interzonalDates ?? 0
          byZone[z.id] = buildParticipants(z.teams, free, interzonal)
        }
        setBracketParticipantsByZone(byZone)
        setBracketParticipants(null)
      } else {
        const participants = buildParticipants(
          selectedTeams,
          freeDates,
          interzonalDates
        )
        setBracketParticipants(participants)
        setBracketParticipantsByZone({})
      }
      setValue('fixtureGenerated', true, { shouldValidate: true })
    }
    // For all-vs-all, the FixtureTodosContraTodos component handles generation via generationKey
  }

  return (
    <div className='space-y-4'>
      <MiniResumen />

      {(isAllVsAll || isElimination) && (
        <div className='space-y-4'>
          {/* Zone config inputs */}
          {useZoneMode ? (
            <TablaConfigZonas
              zonesWithTeams={zonesWithTeams}
              hasMultipleZones={hasMultipleZones}
            />
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
                  value={freeDates}
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
                  value={interzonalDates}
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

          {/* Validation panel + generate button */}
          <PanelValidacion
            validConfig={validConfig}
            isElimination={isElimination}
            isAllVsAll={isAllVsAll}
            useZoneMode={useZoneMode}
            hasMultipleZones={hasMultipleZones}
            zoneValidations={zoneValidations}
            interzonalPairing={interzonalPairing}
            zoneInputs={zoneInputs}
            totalDates={totalDates}
            rounds={rounds}
            teamCount={teamCount}
            freeDates={freeDates}
            interzonalDates={interzonalDates}
            fixtureGenerated={fixtureGenerated}
            fixtureError={errors.fixtureGenerated?.message}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {/* Format-specific fixture view */}
      {isElimination ? (
        <FixtureEliminacionDirecta
          zonesWithTeams={zonesWithTeams}
          useZoneMode={useZoneMode}
          generationKey={generationKey}
          bracketParticipants={bracketParticipants}
          bracketParticipantsByZone={bracketParticipantsByZone}
        />
      ) : isAllVsAll ? (
        <FixtureTodosContraTodos
          zonesWithTeams={zonesWithTeams}
          zoneInputs={zoneInputs}
          useZoneMode={useZoneMode}
          generationKey={generationKey}
          fixtureGenerated={fixtureGenerated}
        />
      ) : null}
    </div>
  )
}
