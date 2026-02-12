import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { isValidForElimination } from '../lib/fixture'
import type { TournamentWizardData, WizardTeam, Zone } from '../types'
import { BracketView } from './BracketView'
import { SelectorDeZona } from './SelectorDeZona'

type BracketParticipant = {
  id: number
  name: string
  club: string
  tournament: string
  zone: string
}

interface FixtureEliminacionDirectaProps {
  zonesWithTeams: (Zone & { freeDates?: number; interzonalDates?: number })[]
  useZoneMode: boolean
  generationKey: number
  bracketParticipants?: BracketParticipant[] | null
  bracketParticipantsByZone?: Record<string, BracketParticipant[]>
}

/**
 * Fallback antes de generar: construye participantes con pairings válidos
 * (nunca LIBRE vs LIBRE, INTERZONAL vs INTERZONAL, ni LIBRE vs INTERZONAL).
 * Usa orden determinístico: los últimos numPlaceholders pares tienen (equipo, placeholder).
 */
function buildParticipantsFallback(
  teams: WizardTeam[],
  freeDates: number,
  interzonalDates: number
): BracketParticipant[] {
  const numPlaceholders = freeDates + interzonalDates
  const total = teams.length + numPlaceholders
  const numPairs = total / 2

  const placeholders: BracketParticipant[] = [
    ...Array.from({ length: freeDates }, (_, i) => ({
      id: -1 - i,
      name: 'LIBRE',
      club: '',
      tournament: '',
      zone: ''
    })),
    ...Array.from({ length: interzonalDates }, (_, i) => ({
      id: -100 - i,
      name: 'INTERZONAL',
      club: '',
      tournament: '',
      zone: ''
    }))
  ]

  const result: BracketParticipant[] = []
  let teamIdx = 0
  let placeholderIdx = 0

  for (let p = 0; p < numPairs; p++) {
    const isPlaceholderPair = p >= numPairs - numPlaceholders
    if (isPlaceholderPair) {
      result.push(teams[teamIdx++])
      result.push(placeholders[placeholderIdx++])
    } else {
      result.push(teams[teamIdx++])
      result.push(teams[teamIdx++])
    }
  }

  return result
}

export function FixtureEliminacionDirecta({
  zonesWithTeams,
  useZoneMode,
  generationKey,
  bracketParticipants = null,
  bracketParticipantsByZone = {}
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

  const participantsForDisplay = useZoneMode
    ? selectedZone
      ? bracketParticipantsByZone[selectedZone.id] ??
        buildParticipantsFallback(
          selectedZone.teams,
          selectedZone.freeDates ?? 0,
          selectedZone.interzonalDates ?? 0
        )
      : []
    : bracketParticipants ??
      buildParticipantsFallback(
        selectedTeams,
        freeDates,
        interzonalDates
      )

  const teamSlots = useZoneMode
    ? selectedZone
      ? selectedZone.teams.length +
        (selectedZone.freeDates ?? 0) +
        (selectedZone.interzonalDates ?? 0)
      : 0
    : selectedTeams.length + freeDates + interzonalDates

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
                zones={zonesWithTeams.map((z) => {
                  const total =
                    z.teams.length +
                    (z.freeDates ?? 0) +
                    (z.interzonalDates ?? 0)
                  return {
                    id: z.id,
                    name: z.name,
                    detail: `${z.teams.length} equipos${
                      (z.freeDates ?? 0) + (z.interzonalDates ?? 0) > 0
                        ? ` + ${(z.freeDates ?? 0) + (z.interzonalDates ?? 0)} libre/interzonal = ${total} participantes`
                        : ''
                    }`
                  }
                })}
                selectedZoneId={selectedEliminationZoneId}
                onZoneChange={setSelectedEliminationZoneId}
                label='Ver llave de:'
              />
              {selectedEliminationZoneId &&
                selectedZone &&
                participantsForDisplay.length > 0 && (
                  <BracketView
                    teamSlots={teamSlots}
                    teams={participantsForDisplay}
                    zones={zones}
                  />
                )}
            </>
          ) : (
            <BracketView
              teamSlots={teamSlots}
              teams={participantsForDisplay}
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
