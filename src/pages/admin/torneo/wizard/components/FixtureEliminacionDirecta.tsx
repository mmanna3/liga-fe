import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { isValidForElimination } from '../lib/fixture'
import type { TournamentWizardData, Zone } from '../types'
import { BracketView } from './BracketView'
import { SelectorDeZona } from './SelectorDeZona'

interface FixtureEliminacionDirectaProps {
  zonesWithTeams: (Zone & { freeDates?: number; interzonalDates?: number })[]
  useZoneMode: boolean
  generationKey: number
}

export function FixtureEliminacionDirecta({
  zonesWithTeams,
  useZoneMode,
  generationKey
}: FixtureEliminacionDirectaProps) {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const selectedTeams = watch('selectedTeams')
  const freeDates = watch('freeDates')
  const interzonalDates = watch('interzonalDates')
  const zones = watch('zones')
  const teamCount = selectedTeams.length

  const [selectedEliminationZoneId, setSelectedEliminationZoneId] =
    useState<string>('')

  // Auto-select first zone
  useEffect(() => {
    if (zonesWithTeams.length > 0) {
      const exists = zonesWithTeams.some(
        (z) => z.id === selectedEliminationZoneId
      )
      if (!selectedEliminationZoneId || !exists) {
        setSelectedEliminationZoneId(zonesWithTeams[0].id)
      }
    }
  }, [zonesWithTeams, selectedEliminationZoneId])

  // Auto-suggest freeDates to reach next power of 2
  useEffect(() => {
    if (!useZoneMode && teamCount > 0) {
      const T = teamCount + freeDates + interzonalDates
      if (!isValidForElimination(teamCount, freeDates, interzonalDates)) {
        const nextPower = Math.pow(2, Math.ceil(Math.log2(Math.max(2, T))))
        const needed = nextPower - T
        if (needed > 0 && freeDates === 0 && interzonalDates === 0) {
          setValue('freeDates', needed)
        }
      }
    }
  }, [teamCount, useZoneMode])

  const selectedZone = zonesWithTeams.find(
    (z) => z.id === selectedEliminationZoneId
  )

  return (
    <div key={generationKey} className='bg-background rounded-xl border p-4'>
      {selectedTeams.length > 0 ? (
        <div>
          <h4 className='font-semibold mb-4 flex items-center gap-2'>
            <CalendarIcon className='w-5 h-5 text-primary' />
            Llaves de eliminación directa
          </h4>
          {zonesWithTeams.length > 0 ? (
            <>
              <SelectorDeZona
                zones={zonesWithTeams.map((z) => ({
                  id: z.id,
                  name: z.name,
                  detail: `${z.teams.length} equipos`
                }))}
                selectedZoneId={selectedEliminationZoneId}
                onZoneChange={setSelectedEliminationZoneId}
                label='Ver llave de:'
              />
              {selectedEliminationZoneId && selectedZone && (
                <BracketView
                  teamSlots={selectedZone.teams.length}
                  teams={selectedZone.teams}
                  zones={zones}
                />
              )}
            </>
          ) : (
            <BracketView
              teamSlots={selectedTeams.length}
              teams={selectedTeams}
              zones={zones}
            />
          )}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className='text-center py-8 text-muted-foreground'>
      <CalendarIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
      <p className='text-sm'>
        Hacé clic en &quot;Generar fixture&quot; para crear el calendario de
        jornadas
      </p>
    </div>
  )
}
