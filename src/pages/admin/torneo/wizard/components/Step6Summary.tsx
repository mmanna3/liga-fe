import {
  CheckCircle,
  Trophy,
  Calendar,
  Users,
  MapPin,
  Target,
  Edit
} from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useWizardStore } from '../use-wizard-store'
import type { TournamentWizardData } from '../types'
import { BracketView } from './BracketView'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Step6Summary() {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const { goToStep } = useWizardStore()

  const data = {
    name: watch('name'),
    season: watch('season'),
    type: watch('type'),
    categories: watch('categories'),
    phases: watch('phases'),
    currentPhaseIndex: watch('currentPhaseIndex'),
    selectedTeams: watch('selectedTeams'),
    zones: watch('zones'),
    preventSameClub: watch('preventSameClub'),
    fixtureGenerated: watch('fixtureGenerated'),
    hasFreeBye: watch('hasFreeBye'),
    hasInterzonal: watch('hasInterzonal'),
    status: watch('status')
  }

  const currentPhase = data.phases[data.currentPhaseIndex] ?? data.phases[0]
  const phaseName = currentPhase?.name ?? 'Fase 1'

  const typeLabels: Record<string, string> = {
    FUTSAL: 'Futsal',
    BABY: 'Baby',
    'FUTBOL 11': 'Fútbol 11',
    FEMENINO: 'Femenino'
  }

  const getFormatDisplay = () => {
    if (!currentPhase) return ''

    const formatText =
      currentPhase.format === 'all-vs-all'
        ? 'Todos contra todos'
        : 'Eliminación directa'
    const roundsText =
      currentPhase.rounds === 'double' ? 'Ida y vuelta' : 'Solo ida'

    return `${formatText} - ${roundsText}`
  }

  return (
    <div className='space-y-4'>
      <div className='text-center mb-6'>
        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3'>
          <CheckCircle className='w-10 h-10 text-primary' />
        </div>
        <h3 className='text-lg font-semibold mb-1'>
          Resumen de {phaseName}
        </h3>
        <p className='text-muted-foreground text-sm'>
          Revisa la configuración antes de crear el torneo
        </p>
      </div>

      <div className='bg-muted rounded-xl p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Trophy className='w-4 h-4 text-primary-foreground' />
            </div>
            <h4 className='font-semibold text-sm'>Información general</h4>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => goToStep(1)}
          >
            <Edit className='w-4 h-4' />
          </Button>
        </div>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <p className='text-xs text-muted-foreground mb-0.5'>
              Nombre - Año
            </p>
            <p className='font-medium'>
              {data.name || '-'} - {data.season}
            </p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-0.5'>Tipo</p>
            <p className='font-medium'>
              {data.type ? (typeLabels[data.type] ?? data.type) : '-'}
            </p>
          </div>
          <div className='col-span-2'>
            <p className='text-xs text-muted-foreground mb-1'>Categorías</p>
            <div className='flex flex-wrap gap-1.5'>
              {data.categories
                .filter((c) => c.name)
                .map((cat) => (
                  <span
                    key={cat.id}
                    className='px-2 py-0.5 bg-background rounded text-xs font-medium'
                  >
                    {cat.name}
                    {cat.yearFrom &&
                      cat.yearFrom !== 'TODAS' &&
                      ` (${cat.yearFrom}/${cat.yearTo})`}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {currentPhase && (
        <div className='bg-muted rounded-xl p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <Calendar className='w-4 h-4 text-primary-foreground' />
              </div>
              <h4 className='font-semibold text-sm'>
                Fase del torneo (solo {phaseName})
              </h4>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => goToStep(2)}
            >
              <Edit className='w-4 h-4' />
            </Button>
          </div>
          <div className='bg-background rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='w-6 h-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-xs font-bold'>
                1
              </span>
              <span className='font-semibold text-sm'>{phaseName}</span>
            </div>
            <div className='text-xs text-muted-foreground'>
              <span className='font-medium'>Formato:</span>{' '}
              {getFormatDisplay()}
            </div>
          </div>
          {data.zones.length > 0 && (
            <div className='mt-2'>
              <p className='text-xs text-muted-foreground'>
                <span className='font-medium'>Zonas:</span>{' '}
                {data.zones.length}
              </p>
            </div>
          )}
        </div>
      )}

      <div className='bg-muted rounded-xl p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Users className='w-4 h-4 text-primary-foreground' />
            </div>
            <h4 className='font-semibold text-sm'>
              Equipos participantes de {phaseName}
            </h4>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => goToStep(3)}
          >
            <Edit className='w-4 h-4' />
          </Button>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <p className='text-muted-foreground'>
              {data.selectedTeams.length} equipos
            </p>
            {data.selectedTeams.length % 2 !== 0 && (
              <span className='px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs font-medium'>
                Impar
              </span>
            )}
          </div>
          {data.selectedTeams.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mt-2'>
              {data.selectedTeams.slice(0, 15).map((team) => (
                <span
                  key={team.id}
                  className='px-2 py-1 bg-background rounded text-xs font-medium shadow-sm'
                >
                  {team.name}
                </span>
              ))}
              {data.selectedTeams.length > 15 && (
                <span className='px-2 py-1 bg-secondary rounded text-xs font-medium'>
                  +{data.selectedTeams.length - 15} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {data.zones.length > 0 && (
        <div className='bg-muted rounded-xl p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <MapPin className='w-4 h-4 text-primary-foreground' />
              </div>
              <h4 className='font-semibold text-sm'>
                Zonas de {phaseName}
              </h4>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => goToStep(4)}
            >
              <Edit className='w-4 h-4' />
            </Button>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {data.zones.map((zone) => (
              <div key={zone.id} className='bg-background rounded-lg p-2'>
                <p className='font-semibold text-xs mb-1'>{zone.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {zone.teams.length} equipo
                  {zone.teams.length !== 1 ? 's' : ''}
                </p>
                <div className='mt-1 space-y-0.5'>
                  {zone.teams.slice(0, 2).map((team) => (
                    <p key={team.id} className='text-xs'>
                      • {team.name}
                    </p>
                  ))}
                  {zone.teams.length > 2 && (
                    <p className='text-xs text-muted-foreground'>
                      +{zone.teams.length - 2} más
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {data.preventSameClub && (
            <div className='mt-2 p-2 bg-primary/10 rounded-lg'>
              <p className='text-xs font-medium'>
                Restricción: Mismo club no en misma zona
              </p>
            </div>
          )}
        </div>
      )}

      <div className='bg-muted rounded-xl p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Target className='w-4 h-4 text-primary-foreground' />
            </div>
            <h4 className='font-semibold text-sm'>
              Fixture de {phaseName}
            </h4>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => goToStep(5)}
          >
            <Edit className='w-4 h-4' />
          </Button>
        </div>
        <div className='space-y-2'>
          {data.fixtureGenerated ? (
            <>
              <p className='text-sm text-muted-foreground'>
                Fixture generado exitosamente
              </p>
              {data.hasFreeBye && (
                <p className='text-sm text-muted-foreground'>
                  • Incluye equipos libres
                </p>
              )}
              {data.hasInterzonal && (
                <p className='text-sm text-muted-foreground'>
                  • Incluye fechas interzonales
                </p>
              )}

              <div className='mt-3 bg-background rounded-lg p-3'>
                <h5 className='font-semibold text-xs mb-2'>
                  Vista de llaves
                </h5>
                <BracketView
                  teamSlots={data.selectedTeams.length}
                  teams={data.selectedTeams}
                  zones={data.zones}
                />
              </div>
            </>
          ) : (
            <div className='bg-amber-50 border border-amber-200 rounded-xl p-3'>
              <div className='flex items-start gap-2'>
                <div className='flex-1'>
                  <p className='font-semibold text-sm mb-1'>
                    Fixture no generado
                  </p>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Es necesario generar el fixture antes de crear el torneo.
                  </p>
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => goToStep(5)}
                  >
                    <Target className='w-3 h-3' />
                    Ir al paso 5 para generar fixture
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='bg-muted rounded-xl p-6 border'>
        <div className='text-center mb-4'>
          <h4 className='text-lg font-bold mb-1'>
            ¿Listo para crear el torneo?
          </h4>
          <p className='text-xs text-muted-foreground'>
            Selecciona si deseas guardar el torneo como borrador o publicarlo
            inmediatamente
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={() => setValue('status', 'draft')}
            className={cn(
              'px-6 py-4 rounded-xl font-semibold transition-all text-center',
              data.status === 'draft'
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-background border-2 text-muted-foreground hover:bg-accent'
            )}
          >
            <div className='text-sm'>Guardar como borrador</div>
            <p className='text-xs mt-1 opacity-80'>
              Podrás editarlo más tarde
            </p>
          </button>
          <button
            type='button'
            onClick={() => setValue('status', 'published')}
            className={cn(
              'px-6 py-4 rounded-xl font-semibold transition-all text-center',
              data.status === 'published'
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-background border-2 text-muted-foreground hover:bg-accent'
            )}
          >
            <div className='text-sm'>Publicar</div>
            <p className='text-xs mt-1 opacity-80'>
              Estará visible para todos
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
