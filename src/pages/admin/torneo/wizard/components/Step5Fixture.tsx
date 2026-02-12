import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
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

  const handleGenerate = () => {
    setGenerationKey((k) => k + 1)

    if (isElimination) {
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
