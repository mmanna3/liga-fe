import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { ArrowLeft, Calendar, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import {
  LABEL_FORMAT,
  LABEL_MATCH_TYPE,
  mockTournamentsDetail,
  type TournamentDetail
} from './data/mock-tournament-detail'

function InformacionDelTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [tournament] = useState<TournamentDetail | null>(
    () =>
      (location.state as { tournament?: TournamentDetail } | null)
        ?.tournament ??
      mockTournamentsDetail.find((t) => t.id === id) ??
      null
  )

  if (!tournament) {
    return (
      <div className='p-8 text-center'>
        <p className='text-muted-foreground'>Torneo no encontrado</p>
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => navigate(rutasNavegacion.torneosHome)}
        >
          Volver
        </Button>
      </div>
    )
  }

  const categoriesWithName = tournament.categories.filter((c) => c.name)

  return (
    <div className='space-y-6 max-w-7xl mx-auto px-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate(rutasNavegacion.torneosHome)}
          className='rounded-xl'
        >
          <ArrowLeft className='w-5 h-5' />
        </Button>
        <h1 className='text-2xl font-bold text-gray-800'>{tournament.name}</h1>
      </div>

      {/* Información general - estilo home */}
      <div className='relative bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-6 shadow-xl'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='font-semibold text-gray-800 text-lg mb-1'>
              {tournament.name || 'Nombre del torneo'}
            </h3>
            <p className='text-gray-600 text-sm mb-3'>
              Temporada {tournament.season}
            </p>
            {categoriesWithName.length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {categoriesWithName.map((category) => (
                  <Badge
                    key={category.id}
                    variant='secondary'
                    className='bg-primary/10 text-primary border-none shadow-md text-xs'
                  >
                    {category.name}
                    {(category.yearFrom || category.yearTo) && (
                      <span className='ml-1'>
                        ({category.yearFrom || '—'}/{category.yearTo || '—'})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9 rounded-xl shrink-0'
            onClick={() =>
              navigate(
                `${rutasNavegacion.torneosInformacion}/${tournament.id}/editar`,
                { state: { tournament } }
              )
            }
            title='Editar información del torneo'
          >
            <Pencil className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Fases: pestañas más altas, datos en columna */}
      <div className='bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-6 shadow-xl'>
        <div className='flex items-center gap-2 mb-4'>
          <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
            <Calendar className='w-5 h-5 text-gray-800' />
          </div>
          <h2 className='text-lg font-bold text-gray-800'>Fases</h2>
        </div>

        <Tabs defaultValue={tournament.phases[0]?.id} className='w-full'>
          <TabsList className='flex flex-wrap w-full gap-2 p-2 bg-transparent border-none rounded-xl mb-6 min-h-[4.5rem]'>
            {tournament.phases.map((phase) => (
              <TabsTrigger
                key={phase.id}
                value={phase.id}
                className='flex-1 min-w-[8rem] h-14 rounded-xl bg-white/50 text-gray-800 shadow-md data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-lg font-semibold hover:bg-white/70'
              >
                {phase.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tournament.phases.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className='mt-0'>
              <div className='space-y-6'>
                {/* Datos de la fase: uno debajo del otro */}
                <div className='flex items-start justify-between bg-white/10 border-2 border-white/30 rounded-xl p-5'>
                  <div className='space-y-2'>
                    <div>
                      <span
                        className={cn(
                          'inline-block px-3 py-1.5 rounded-lg text-sm font-semibold',
                          phase.status === 'published'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-amber-500 text-white'
                        )}
                      >
                        {phase.status === 'published'
                          ? 'PUBLICADA'
                          : 'BORRADOR'}
                      </span>
                    </div>
                    <p className='text-gray-800 font-medium'>
                      {LABEL_FORMAT[phase.format]}
                    </p>
                    <p className='text-gray-600 text-sm'>
                      {LABEL_MATCH_TYPE[phase.matchType]}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {phase.zones.map((zone) => (
                    <div
                      key={zone.id}
                      className='bg-white/10 border-2 border-white/30 rounded-xl p-4 space-y-3'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-semibold text-gray-800'>
                          {zone.name}
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 rounded-lg'
                          onClick={() =>
                            navigate(
                              `${rutasNavegacion.torneosInformacion}/${tournament.id}/zonas?fase=${phase.id}&zona=${zone.id}`
                            )
                          }
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                      </div>
                      <div className='flex flex-wrap gap-1.5'>
                        {zone.teams.map((team) => (
                          <span
                            key={team.id}
                            className='px-2 py-1 bg-white/20 rounded-lg text-sm text-gray-700'
                          >
                            {team.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

export default function InformacionDelTorneoPage() {
  return <InformacionDelTorneo />
}
