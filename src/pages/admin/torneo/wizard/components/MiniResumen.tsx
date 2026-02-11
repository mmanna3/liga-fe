import { Badge } from '@/components/ui/badge'
import { useFormContext } from 'react-hook-form'
import type { TournamentWizardData } from '../types'

interface MiniResumenProps {
  children?: React.ReactNode
}

export function MiniResumen({ children }: MiniResumenProps) {
  const { watch } = useFormContext<TournamentWizardData>()

  const name = watch('name')
  const categories = watch('categories')
  const phases = watch('phases')
  const currentPhaseIndex = watch('currentPhaseIndex')
  const selectedTeams = watch('selectedTeams')

  const currentPhase =
    phases.length > 0 ? (phases[currentPhaseIndex] ?? phases[0]) : null
  const isElimination = currentPhase?.format === 'elimination'
  const categoriesWithName = categories.filter((c) => c.name)

  const hasPhaseInfo = currentPhase != null
  const hasTeamsCount = selectedTeams.length > 0

  return (
    <div className='bg-primary/10 rounded-lg p-4'>
      <h3 className='font-semibold text-foreground mb-1'>
        {name || 'Nombre del torneo'}
      </h3>

      {categoriesWithName.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-2'>
          {categoriesWithName.map((category) => (
            <Badge key={category.id} variant='secondary' className='text-xs'>
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

      {(hasPhaseInfo || hasTeamsCount) && (
        <p className='text-sm text-muted-foreground'>
          {hasPhaseInfo && (
            <>
              Fase:{' '}
              <span className='font-semibold text-foreground'>
                {currentPhase.name}
              </span>
            </>
          )}
          {hasPhaseInfo && (
            <>
              {' - '}
              <span>
                {isElimination ? 'Eliminación directa' : 'Todos contra todos'}
              </span>
              {' - '}
              <span>
                {currentPhase.rounds === 'single' ? 'Ida' : 'Ida y vuelta'}
              </span>
            </>
          )}
          {hasTeamsCount && (
            <>
              {hasPhaseInfo && ' - '}
              <span className='font-semibold'>
                {selectedTeams.length} equipos
              </span>
            </>
          )}
        </p>
      )}

      {children}
    </div>
  )
}
