import { useState, useEffect } from 'react'
import { Shuffle, Edit2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useFormContext } from 'react-hook-form'
import type { TournamentWizardData, Zone, WizardTeam } from '../types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Step4Zones() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<TournamentWizardData>()
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [draggedTeam, setDraggedTeam] = useState<{
    team: WizardTeam
    fromZoneId: string
  } | null>(null)

  const data = {
    name: watch('name'),
    phases: watch('phases'),
    currentPhaseIndex: watch('currentPhaseIndex'),
    selectedTeams: watch('selectedTeams'),
    zonesCount: watch('zonesCount'),
    zones: watch('zones'),
    preventSameClub: watch('preventSameClub')
  }

  const currentPhase = data.phases[data.currentPhaseIndex]

  useEffect(() => {
    if (data.zones.length === 0 && data.selectedTeams.length > 0) {
      initializeZones()
    }
  }, [data.selectedTeams.length])

  const initializeZones = () => {
    const zones: Zone[] = []
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (let i = 0; i < data.zonesCount; i++) {
      zones.push({
        id: `zone-${i}`,
        name: `Zona ${letters[i] || String(i + 1)}`,
        teams: [],
        phaseId: currentPhase?.id || ''
      })
    }

    setValue('zones', zones)
  }

  const randomizeTeams = () => {
    if (data.zones.length === 0) return

    const shuffled = [...data.selectedTeams].sort(() => Math.random() - 0.5)
    const teamsPerZone = Math.ceil(shuffled.length / data.zonesCount)

    const newZones = data.zones.map((zone, index) => {
      const startIdx = index * teamsPerZone
      const endIdx = startIdx + teamsPerZone
      let zoneTeams = shuffled.slice(startIdx, endIdx)

      if (data.preventSameClub) {
        zoneTeams = zoneTeams.filter((team, idx, arr) => {
          const hasSameClub = arr.some(
            (t, i) => i !== idx && t.club === team.club
          )
          return !hasSameClub
        })
      }

      return { ...zone, teams: zoneTeams }
    })

    setValue('zones', newZones)
  }

  const handleDragStart = (team: WizardTeam, zoneId: string) => {
    setDraggedTeam({ team, fromZoneId: zoneId })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetZoneId: string) => {
    if (!draggedTeam) return

    const { team, fromZoneId } = draggedTeam

    if (data.preventSameClub) {
      const targetZone = data.zones.find((z) => z.id === targetZoneId)
      const hasSameClub = targetZone?.teams.some((t) => t.club === team.club)

      if (hasSameClub && fromZoneId !== targetZoneId) {
        toast.warning(
          `No se puede ubicar este equipo en esta zona porque ya hay un equipo del mismo club (${team.club})`
        )
        setDraggedTeam(null)
        return
      }
    }

    const newZones = data.zones.map((zone) => {
      if (zone.id === fromZoneId) {
        return { ...zone, teams: zone.teams.filter((t) => t.id !== team.id) }
      }
      if (zone.id === targetZoneId) {
        return { ...zone, teams: [...zone.teams, team] }
      }
      return zone
    })

    setValue('zones', newZones)
    setDraggedTeam(null)
  }

  const startEditingZone = (zoneId: string, currentName: string) => {
    setEditingZoneId(zoneId)
    setEditingName(currentName)
  }

  const saveZoneName = () => {
    if (editingZoneId) {
      const newZones = data.zones.map((zone) =>
        zone.id === editingZoneId ? { ...zone, name: editingName } : zone
      )
      setValue('zones', newZones)
      setEditingZoneId(null)
    }
  }

  const distributeEvenly = () => {
    if (data.zones.length === 0) return

    const teamsPerZone = Math.floor(
      data.selectedTeams.length / data.zonesCount
    )
    const remainder = data.selectedTeams.length % data.zonesCount

    let teamIndex = 0
    const newZones = data.zones.map((zone, zoneIndex) => {
      const count = teamsPerZone + (zoneIndex < remainder ? 1 : 0)
      const zoneTeams = data.selectedTeams.slice(
        teamIndex,
        teamIndex + count
      )
      teamIndex += count
      return { ...zone, teams: zoneTeams }
    })

    setValue('zones', newZones)
  }

  return (
    <div className='space-y-6'>
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
            </>
          )}
        </p>
        <p className='text-xs text-muted-foreground mt-2'>
          Las zonas son específicas de esta fase
        </p>
      </div>

      <div>
        <h3 className='text-lg font-semibold mb-4'>Zonas</h3>
        <p className='text-muted-foreground text-sm mb-6'>
          Organiza los equipos seleccionados en las zonas de tu torneo
        </p>

        <div className='flex flex-wrap gap-3 mb-6'>
          <Button type='button' variant='outline' onClick={distributeEvenly}>
            Distribuir equitativamente
          </Button>
          <Button type='button' onClick={randomizeTeams}>
            <Shuffle className='w-4 h-4' />
            Sortear aleatoriamente
          </Button>

          <div className='flex items-center gap-2 ml-auto px-4 py-2 bg-muted rounded-lg'>
            <Checkbox
              id='prevent-same-club'
              checked={data.preventSameClub}
              onCheckedChange={(checked) =>
                setValue('preventSameClub', checked === true)
              }
            />
            <Label htmlFor='prevent-same-club' className='cursor-pointer'>
              Evitar mismo club en misma zona
            </Label>
          </div>
        </div>

        {errors.zones && (
          <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg mb-4'>
            <p className='text-sm text-destructive'>{errors.zones.message}</p>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {data.zones.map((zone) => (
            <div
              key={zone.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(zone.id)}
              className='bg-muted rounded-xl p-4 border-2 border-dashed min-h-[300px]'
            >
              <div className='flex items-center justify-between mb-4'>
                {editingZoneId === zone.id ? (
                  <div className='flex items-center gap-2 flex-1'>
                    <Input
                      type='text'
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && saveZoneName()
                      }
                      className='flex-1'
                      autoFocus
                    />
                    <Button
                      type='button'
                      size='icon'
                      className='h-8 w-8'
                      onClick={saveZoneName}
                    >
                      <Check className='w-4 h-4' />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h4 className='font-bold'>{zone.name}</h4>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => startEditingZone(zone.id, zone.name)}
                    >
                      <Edit2 className='w-4 h-4' />
                    </Button>
                  </>
                )}
              </div>

              <div className='text-xs text-muted-foreground mb-3'>
                {zone.teams.length} equipo
                {zone.teams.length !== 1 ? 's' : ''}
              </div>

              <div className='space-y-2'>
                {zone.teams.map((team) => (
                  <div
                    key={team.id}
                    draggable
                    onDragStart={() => handleDragStart(team, zone.id)}
                    className='bg-background p-3 rounded-lg shadow-sm border cursor-move hover:shadow-md hover:border-primary/30 transition-all'
                  >
                    <div className='font-medium text-sm'>{team.name}</div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {team.club}
                    </div>
                  </div>
                ))}

                {zone.teams.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground text-sm'>
                    Arrastra equipos aquí
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.zones.length > 0 &&
          data.selectedTeams.length >
            data.zones.reduce((acc, z) => acc + z.teams.length, 0) && (
            <div className='mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200'>
              <h4 className='font-bold mb-3'>Equipos sin asignar</h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                {data.selectedTeams
                  .filter(
                    (team) =>
                      !data.zones.some((zone) =>
                        zone.teams.some((t) => t.id === team.id)
                      )
                  )
                  .map((team) => (
                    <div
                      key={team.id}
                      className='bg-background p-2 rounded-lg shadow-sm border text-sm'
                    >
                      <div className='font-medium'>{team.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {team.club}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        <div className='mt-6 p-4 bg-muted rounded-lg'>
          <p className='text-sm text-muted-foreground'>
            Arrastra y suelta los equipos entre zonas para organizarlos como
            prefieras
          </p>
        </div>
      </div>
    </div>
  )
}
