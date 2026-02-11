import CajitaConTick from '@/components/ykn-ui/cajita-con-tick'
import { MiniResumen } from './MiniResumen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pencil, Plus, Shuffle, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import type { TournamentWizardData, WizardTeam, Zone } from '../types'

export function Step4Zones() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<TournamentWizardData>()
  const UNSIGNED_ZONE_ID = '__unassigned__'
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null)
  const [draggedTeam, setDraggedTeam] = useState<{
    team: WizardTeam
    fromZoneId: string
  } | null>(null)

  const data = {
    name: watch('name'),
    phases: watch('phases'),
    currentPhaseIndex: watch('currentPhaseIndex'),
    selectedTeams: watch('selectedTeams'),
    zones: watch('zones'),
    preventSameClub: watch('preventSameClub')
  }

  const zonesCount = data.zones.length

  const currentPhase = data.phases[data.currentPhaseIndex]

  useEffect(() => {
    if (data.zones.length === 0) {
      setValue('zones', [
        {
          id: `zone-${Date.now()}`,
          name: 'Zona A',
          teams: [],
          phaseId: currentPhase?.id || ''
        }
      ])
    }
  }, [data.zones.length, currentPhase?.id, setValue])

  useEffect(() => {
    setValue('zonesCount', data.zones.length)
  }, [data.zones.length, setValue])

  const addZone = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `Zona ${letters[zonesCount] || String(zonesCount + 1)}`,
      teams: [],
      phaseId: currentPhase?.id || ''
    }
    setValue('zones', [...data.zones, newZone])
  }

  const removeZone = (zoneId: string) => {
    if (zonesCount <= 1) return
    setValue(
      'zones',
      data.zones.filter((z) => z.id !== zoneId)
    )
    if (editingZoneId === zoneId) setEditingZoneId(null)
  }

  const randomizeTeams = () => {
    if (data.zones.length === 0) return

    const shuffled = [...data.selectedTeams].sort(() => Math.random() - 0.5)
    const teamsPerZone = Math.ceil(shuffled.length / zonesCount)

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

  const updateZone = (zoneId: string, field: Partial<Zone>) => {
    setValue(
      'zones',
      data.zones.map((z) => (z.id === zoneId ? { ...z, ...field } : z))
    )
  }

  return (
    <div className='space-y-6'>
      <MiniResumen>
        <p className='text-xs text-muted-foreground mt-2'>
          Las zonas son específicas de esta fase
        </p>
      </MiniResumen>

      <div>
        <div className='flex flex-wrap items-center gap-3 mb-6'>
          <Button type='button' onClick={randomizeTeams}>
            <Shuffle className='w-4 h-4' />
            Sortear
          </Button>
          <CajitaConTick
            id='prevent-same-club'
            checked={data.preventSameClub}
            onCheckedChange={(checked) =>
              setValue('preventSameClub', checked)
            }
            label='Evitar equipos del mismo club en la misma zona'
          />
        </div>

        {errors.zones && (
          <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg mb-4'>
            <p className='text-sm text-destructive'>{errors.zones.message}</p>
          </div>
        )}

        <div className='flex justify-end mb-3'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={addZone}
            className='text-muted-foreground hover:text-foreground'
          >
            <Plus className='w-4 h-4' />
            Agregar zona
          </Button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {data.zones.map((zone) => (
            <div
              key={zone.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(zone.id)}
              className='bg-muted rounded-xl p-4 border-2 border-dashed min-h-[300px]'
            >
              <div className='flex items-center justify-between mb-4 gap-2'>
                {editingZoneId === zone.id ? (
                  <Input
                    type='text'
                    value={zone.name}
                    onChange={(e) =>
                      updateZone(zone.id, { name: e.target.value })
                    }
                    onBlur={() => setEditingZoneId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingZoneId(null)
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className='flex-1 min-w-0'
                  />
                ) : (
                  <>
                    <h4
                      className='font-bold cursor-pointer hover:text-primary transition-colors flex-1 min-w-0'
                      onClick={() => setEditingZoneId(zone.id)}
                    >
                      {zone.name}
                    </h4>
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingZoneId(zone.id)
                      }}
                      role='button'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingZoneId(zone.id)
                      }}
                      className='p-1 hover:bg-accent rounded transition-colors cursor-pointer'
                    >
                      <Pencil className='w-3 h-3 text-muted-foreground' />
                    </span>
                  </>
                )}
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0'
                  onClick={(e) => {
                    e.stopPropagation()
                    removeZone(zone.id)
                  }}
                  disabled={zonesCount <= 1}
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
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
                      draggable
                      onDragStart={() =>
                        handleDragStart(team, UNSIGNED_ZONE_ID)
                      }
                      className='bg-background p-2 rounded-lg shadow-sm border text-sm cursor-move hover:shadow-md hover:border-primary/30 transition-all'
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
