import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { TournamentWizardData, WizardTeam } from '../types'
import { mockTeams } from '../data/mock-teams'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Step3Teams() {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  const data = {
    name: watch('name'),
    phases: watch('phases'),
    teamCount: watch('teamCount'),
    selectedTeams: watch('selectedTeams'),
    searchMode: watch('searchMode'),
    filterTournament: watch('filterTournament'),
    filterZone: watch('filterZone'),
    zonesCount: watch('zonesCount')
  }

  const currentPhase = data.phases[0]

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setSelectAll(false)
  }

  const handleFilterChange = (field: Partial<TournamentWizardData>) => {
    Object.entries(field).forEach(([key, value]) => {
      setValue(key as keyof TournamentWizardData, value)
    })
    setSelectAll(false)
  }

  const zones = Array.from(
    new Set(mockTeams.map((t) => t.zone).filter(Boolean))
  ).sort() as string[]
  const tournaments = Array.from(
    new Set(mockTeams.map((t) => t.tournament))
  ).sort()

  const filteredTeams = mockTeams.filter((team) => {
    if (data.searchMode === 'name') {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.id.toString().includes(searchTerm)
      const notSelected = !data.selectedTeams.find((t) => t.id === team.id)
      return matchesSearch && notSelected
    } else {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.club.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTournament =
        !data.filterTournament || team.tournament === data.filterTournament
      const matchesZone = !data.filterZone || team.zone === data.filterZone
      const notSelected = !data.selectedTeams.find((t) => t.id === team.id)

      return matchesSearch && matchesTournament && matchesZone && notSelected
    }
  })

  const handleSelectTeam = (team: WizardTeam) => {
    if (data.selectedTeams.length < data.teamCount) {
      setValue('selectedTeams', [...data.selectedTeams, team])
    }
  }

  const handleRemoveTeam = (teamId: number) => {
    setValue(
      'selectedTeams',
      data.selectedTeams.filter((t) => t.id !== teamId)
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false)
    } else {
      const remaining = data.teamCount - data.selectedTeams.length
      const teamsToAdd = filteredTeams.slice(0, remaining)
      setValue('selectedTeams', [...data.selectedTeams, ...teamsToAdd])
      setSelectAll(true)
    }
  }

  const isOdd = data.teamCount % 2 !== 0

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
            </>
          )}
        </p>
      </div>

      <div className='flex items-start justify-between gap-4 flex-wrap'>
        <div className='w-32'>
          <Label className='mb-1'>Cantidad equipos</Label>
          <Input
            type='number'
            value={data.teamCount}
            onChange={(e) => {
              const count = parseInt(e.target.value, 10) || 0
              setValue('teamCount', count)
              setValue('selectedTeams', data.selectedTeams.slice(0, count))
            }}
            min={2}
            className='text-center font-semibold'
          />
          {isOdd && (
            <p className='text-xs text-amber-600 mt-1'>Impar</p>
          )}
        </div>
        <div className='w-32'>
          <Label className='mb-1'>Cantidad zonas</Label>
          <Input
            type='number'
            value={data.zonesCount}
            onChange={(e) => {
              const count = Math.max(1, parseInt(e.target.value, 10) || 1)
              setValue('zonesCount', count)
            }}
            min={1}
            className='text-center font-semibold'
          />
        </div>

        <div className='flex-1'>
          <h3 className='text-base font-semibold mb-1'>Equipos</h3>
          <p className='text-muted-foreground text-sm mb-3'>
            Selecciona los equipos que participarán en el torneo
          </p>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium'>
          Seleccionados: {data.selectedTeams.length} / {data.teamCount}
        </span>
        <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
          <div
            className='h-full bg-primary transition-all duration-300'
            style={{
              width: `${(data.selectedTeams.length / data.teamCount) * 100}%`
            }}
          />
        </div>
      </div>

      {data.selectedTeams.length > 0 && (
        <div className='bg-muted rounded-xl p-4'>
          <h4 className='text-sm font-semibold mb-3'>Equipos seleccionados</h4>
          <div className='flex flex-wrap gap-2'>
            {data.selectedTeams.map((team) => (
              <div
                key={team.id}
                className='flex items-center gap-2 bg-background px-3 py-2 rounded-lg shadow-sm'
              >
                <span className='text-sm font-medium'>{team.name}</span>
                <button
                  type='button'
                  onClick={() => handleRemoveTeam(team.id)}
                  className='text-muted-foreground hover:text-destructive transition-colors'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label className='mb-3'>Búsqueda de equipo</Label>
        <div className='flex gap-3 mb-4'>
          <Button
            type='button'
            variant={data.searchMode === 'name' ? 'default' : 'secondary'}
            className='flex-1'
            onClick={() => setValue('searchMode', 'name')}
          >
            Por Nombre/Código
          </Button>
          <Button
            type='button'
            variant={
              data.searchMode === 'tournament' ? 'default' : 'secondary'
            }
            className='flex-1'
            onClick={() => setValue('searchMode', 'tournament')}
          >
            Desde otro torneo
          </Button>
        </div>

        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <Input
            type='text'
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              data.searchMode === 'name'
                ? 'Buscar por nombre o código...'
                : 'Buscar equipos...'
            }
            className='pl-10'
          />
        </div>

        {data.searchMode === 'tournament' && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <Label className='mb-2'>Torneo</Label>
              <select
                value={data.filterTournament}
                onChange={(e) =>
                  handleFilterChange({ filterTournament: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todos los torneos</option>
                {tournaments.map((tournament) => (
                  <option key={tournament} value={tournament}>
                    {tournament}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className='mb-2'>Zona</Label>
              <select
                value={data.filterZone}
                onChange={(e) =>
                  handleFilterChange({ filterZone: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todas las zonas</option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className='border rounded-xl overflow-hidden'>
        <div className='bg-muted px-4 py-3 border-b flex items-center justify-between'>
          <h4 className='text-sm font-semibold'>Equipos disponibles</h4>
          {filteredTeams.length > 0 &&
            data.selectedTeams.length < data.teamCount && (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='select-all'
                  checked={selectAll}
                  onCheckedChange={() => handleSelectAll()}
                />
                <Label htmlFor='select-all' className='text-xs cursor-pointer'>
                  {selectAll ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </Label>
              </div>
            )}
        </div>
        <div className='max-h-96 overflow-y-auto'>
          {filteredTeams.length === 0 ? (
            <div className='p-8 text-center text-muted-foreground'>
              No se encontraron equipos
            </div>
          ) : (
            <table className='w-full'>
              <thead className='bg-muted sticky top-0'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                    Código
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                    Nombre
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                    Club
                  </th>
                  {data.searchMode === 'tournament' && (
                    <>
                      <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                        Torneo
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                        Zona
                      </th>
                    </>
                  )}
                  <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {filteredTeams.slice(0, 50).map((team) => (
                  <tr
                    key={team.id}
                    className='hover:bg-muted/50 transition-colors'
                  >
                    <td className='px-4 py-3 text-sm text-muted-foreground'>
                      {team.id}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium'>
                      {team.name}
                    </td>
                    <td className='px-4 py-3 text-sm text-muted-foreground'>
                      {team.club}
                    </td>
                    {data.searchMode === 'tournament' && (
                      <>
                        <td className='px-4 py-3 text-sm text-muted-foreground'>
                          {team.tournament}
                        </td>
                        <td className='px-4 py-3 text-sm text-muted-foreground'>
                          {team.zone || '-'}
                        </td>
                      </>
                    )}
                    <td className='px-4 py-3'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => handleSelectTeam(team)}
                        disabled={
                          data.selectedTeams.length >= data.teamCount
                        }
                      >
                        Seleccionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
