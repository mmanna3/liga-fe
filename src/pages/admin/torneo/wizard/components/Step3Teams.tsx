import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import SelectorSimple from '@/components/ykn-ui/selector-simple'
import TituloDeInput from '@/components/ykn-ui/titulo-de-input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { mockTeams } from '../data/mock-teams'
import type { TournamentWizardData, WizardTeam } from '../types'
import { MiniResumen } from './MiniResumen'

export function Step3Teams() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<TournamentWizardData>()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  const data = {
    name: watch('name'),
    phases: watch('phases'),
    teamCount: watch('teamCount'),
    selectedTeams: watch('selectedTeams'),
    searchMode: watch('searchMode'),
    filterYear: watch('filterYear'),
    filterType: watch('filterType'),
    filterTournament: watch('filterTournament'),
    filterPhase: watch('filterPhase'),
    filterZone: watch('filterZone')
  }

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
      const matchesYear = !data.filterYear || team.year === data.filterYear
      const matchesType = !data.filterType || team.type === data.filterType
      const matchesTournament =
        !data.filterTournament || team.tournament === data.filterTournament
      const matchesPhase = !data.filterPhase || team.phase === data.filterPhase
      const matchesZone = !data.filterZone || team.zone === data.filterZone
      const notSelected = !data.selectedTeams.find((t) => t.id === team.id)

      return (
        matchesSearch &&
        matchesYear &&
        matchesType &&
        matchesTournament &&
        matchesPhase &&
        matchesZone &&
        notSelected
      )
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

  return (
    <div className='space-y-4'>
      <MiniResumen />

      <div className='flex items-center gap-4'>
        <div>
          <TituloDeInput className='mb-1'>Equipos</TituloDeInput>
          <Input
            type='number'
            value={data.teamCount}
            onChange={(e) => {
              const count = parseInt(e.target.value, 10) || 0
              setValue('teamCount', count)
              setValue('selectedTeams', data.selectedTeams.slice(0, count))
            }}
            min={2}
            className='font-semibold w-20 h-11'
          />
        </div>
        <div className='flex items-center gap-2 flex-1 min-w-0 mt-6'>
          <span className='text-sm font-medium'>
            Seleccionados: {data.selectedTeams.length} / {data.teamCount}
          </span>
          <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-300',
                data.selectedTeams.length === data.teamCount
                  ? 'bg-primary'
                  : 'bg-amber-500'
              )}
              style={{
                width: `${(data.selectedTeams.length / data.teamCount) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {errors.selectedTeams && (
        <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg'>
          <p className='text-sm text-destructive'>
            {errors.selectedTeams.message}
          </p>
        </div>
      )}

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
        <TituloDeInput>Búsqueda de equipo</TituloDeInput>
        <SelectorSimple
          opciones={[
            { id: 'name', texto: 'Por Nombre/Código' },
            { id: 'tournament', texto: 'Desde otro torneo' }
          ]}
          valorActual={data.searchMode}
          alElegirOpcion={(id) =>
            setValue('searchMode', id as TournamentWizardData['searchMode'])
          }
          className='mb-4'
        />

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
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4'>
            <div>
              <TituloDeInput className='mb-2'>Año</TituloDeInput>
              <select
                value={data.filterYear}
                onChange={(e) =>
                  handleFilterChange({ filterYear: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todos los años</option>
                <option value='2026'>2026</option>
                <option value='2025'>2025</option>
              </select>
            </div>

            <div>
              <TituloDeInput className='mb-2'>Tipo</TituloDeInput>
              <select
                value={data.filterType}
                onChange={(e) =>
                  handleFilterChange({ filterType: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todos los tipos</option>
                <option value='FUTSAL'>FUTSAL</option>
                <option value='BABY'>BABY</option>
                <option value='FUTBOL 11'>FUTBOL 11</option>
              </select>
            </div>

            <div>
              <TituloDeInput className='mb-2'>Torneo</TituloDeInput>
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
              <TituloDeInput className='mb-2'>Fase</TituloDeInput>
              <select
                value={data.filterPhase}
                onChange={(e) =>
                  handleFilterChange({ filterPhase: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todas las fases</option>
                <option value='Apertura'>Apertura</option>
                <option value='Clausura'>Clausura</option>
              </select>
            </div>

            <div>
              <TituloDeInput className='mb-2'>Zona</TituloDeInput>
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
                <TituloDeInput
                  htmlFor='select-all'
                  className='mb-0 text-xs cursor-pointer'
                >
                  {selectAll ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </TituloDeInput>
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
                        disabled={data.selectedTeams.length >= data.teamCount}
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
