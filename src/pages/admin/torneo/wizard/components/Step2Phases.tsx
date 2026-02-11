import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SelectorSimple from '@/components/ykn-ui/selector-simple'
import TituloDeInput from '@/components/ykn-ui/titulo-de-input'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Phase, TournamentWizardData } from '../types'
import { ReglasDeDesempate } from './ReglasDeDesempate'

export function Step2Phases() {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [editingPhaseName, setEditingPhaseName] = useState<string | null>(null)

  const data = {
    format: watch('format'),
    name: watch('name'),
    categories: watch('categories'),
    phases: watch('phases')
  }

  useEffect(() => {
    if (data.format && data.phases.length === 0) {
      initializePhasesForFormat()
    }
  }, [data.format])

  const createPhase = (
    name: string,
    format: 'all-vs-all' | 'elimination'
  ): Phase => ({
    id: Date.now().toString() + Math.random(),
    name,
    format,
    rounds: 'double',
    zoneFormats: {},
    tiebreakers: [
      'Diferencia de Goles',
      'Goles a Favor',
      'Resultado entre sí',
      'Sorteo',
      'Manual'
    ],
    transitionMode: 'automatic',
    qualifiersPerZone: 2,
    qualifiersStartPosition: 1,
    qualifiersEndPosition: 2,
    crossGroupQualifiers: 0,
    comparisonMode: 'total-points',
    enableTriangular: false,
    tieResolution: 'penalties',
    transitionRules: [
      'Diferencia de Goles',
      'Mejores de tabla general (Cross-Group)',
      'Sorteo'
    ],
    completed: false
  })

  const initializePhasesForFormat = () => {
    const newPhases: Phase[] = []

    if (data.format === 'ANUAL') {
      newPhases.push(createPhase('Apertura', 'all-vs-all'))
      newPhases.push(createPhase('Clausura', 'all-vs-all'))
    } else if (data.format === 'MUNDIAL') {
      newPhases.push(createPhase('Fase de grupos', 'all-vs-all'))
      newPhases.push(createPhase('Playoffs', 'elimination'))
    } else if (data.format === 'RELAMPAGO') {
      newPhases.push(createPhase('Eliminación directa', 'elimination'))
    } else if (data.format === 'PERSONALIZADO') {
      newPhases.push(createPhase('Fase 1', 'all-vs-all'))
    }

    if (newPhases.length > 0) {
      setValue('phases', newPhases)
      setExpandedPhase(newPhases[0].id)
    }
  }

  const addPhase = () => {
    const phaseNumber = data.phases.length + 1
    const newPhase = createPhase(`Fase ${phaseNumber}`, 'all-vs-all')
    setValue('phases', [...data.phases, newPhase])
    setExpandedPhase(newPhase.id)
  }

  const removePhase = (id: string) => {
    if (data.phases.length > 1) {
      setValue(
        'phases',
        data.phases.filter((p) => p.id !== id)
      )
      if (expandedPhase === id) {
        setExpandedPhase(null)
      }
    }
  }

  const updatePhase = (id: string, field: Partial<Phase>) => {
    setValue(
      'phases',
      data.phases.map((p) => (p.id === id ? { ...p, ...field } : p))
    )
  }

  const handleReorderTiebreakers = (
    phaseId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const phase = data.phases.find((p) => p.id === phaseId)
    if (!phase) return

    const newTiebreakers = [...phase.tiebreakers]
    const [moved] = newTiebreakers.splice(fromIndex, 1)
    newTiebreakers.splice(toIndex, 0, moved)

    updatePhase(phaseId, { tiebreakers: newTiebreakers })
  }

  const getFormatLabel = (format: 'all-vs-all' | 'elimination') =>
    format === 'all-vs-all' ? 'Todos contra todos' : 'Eliminación directa'

  const getRoundsLabel = (rounds: 'single' | 'double') =>
    rounds === 'single' ? 'Solo ida' : 'Ida y vuelta'

  const isPhaseEditable = (phaseIndex: number) => {
    if (phaseIndex === 0) return true
    return data.phases[phaseIndex - 1]?.completed || false
  }

  return (
    <div className='space-y-4'>
      <div className='bg-muted rounded-lg p-4'>
        <h3 className='font-semibold text-foreground mb-1'>
          {data.name || 'Nombre del torneo'}
        </h3>
        <div className='flex flex-wrap gap-1.5'>
          {data.categories
            .filter((c) => c.name)
            .map((category) => (
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
      </div>

      <div className='p-3 bg-amber-50 rounded-lg border border-amber-200'>
        <p className='text-sm text-foreground'>
          <strong>Importante:</strong> Durante la creación de este torneo, se
          podrán cargar los "datos generales" de todas las fases, pero solo se
          permitirá configurar las zonas, equipos y fixture de la primera. Luego
          de creado el torneo, vas a poder editar estos mismos datos en las
          fases siguientes.
        </p>
      </div>

      <div className='space-y-2'>
        {data.phases.map((phase, phaseIndex) => {
          const editable = isPhaseEditable(phaseIndex)

          return (
            <div
              key={phase.id}
              className={cn(
                'border rounded-xl overflow-hidden',
                !editable && 'opacity-60'
              )}
            >
              <div className='w-full px-4 py-3 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between'>
                <button
                  type='button'
                  onClick={() =>
                    setExpandedPhase(
                      expandedPhase === phase.id ? null : phase.id
                    )
                  }
                  className='flex items-center gap-3 flex-1'
                  disabled={!editable}
                >
                  {expandedPhase === phase.id ? (
                    <ChevronDown className='w-4 h-4 text-muted-foreground' />
                  ) : (
                    <ChevronRight className='w-4 h-4 text-muted-foreground' />
                  )}
                  <span className='w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-md'>
                    {phaseIndex + 1}
                  </span>
                  {editingPhaseName === phase.id && editable ? (
                    <Input
                      type='text'
                      value={phase.name}
                      onChange={(e) =>
                        updatePhase(phase.id, { name: e.target.value })
                      }
                      onBlur={() => setEditingPhaseName(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingPhaseName(null)
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className='w-48 text-sm'
                    />
                  ) : (
                    <span className='font-semibold text-foreground text-lg'>
                      {phase.name}
                    </span>
                  )}
                  {editable && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingPhaseName(phase.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditingPhaseName(phase.id)
                      }}
                      role='button'
                      tabIndex={0}
                      className='p-1 hover:bg-accent rounded transition-colors cursor-pointer'
                    >
                      <Pencil className='w-3 h-3 text-muted-foreground' />
                    </span>
                  )}
                  <span className='text-sm text-muted-foreground'>
                    • {getFormatLabel(phase.format)}
                  </span>
                  {phase.format === 'all-vs-all' && (
                    <span className='text-sm text-muted-foreground'>
                      • {getRoundsLabel(phase.rounds)}
                    </span>
                  )}
                </button>
                <div className='flex items-center gap-2'>
                  {data.phases.length > 1 && editable && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                      onClick={(e) => {
                        e.stopPropagation()
                        removePhase(phase.id)
                      }}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              </div>

              {expandedPhase === phase.id && (
                <div className='p-4 space-y-6'>
                  {!editable && (
                    <div className='p-3 bg-amber-50 rounded-lg border border-amber-200'>
                      <p className='text-sm text-foreground'>
                        La edición de esta fase se habilitará una vez finalizada
                        la anterior
                      </p>
                    </div>
                  )}

                  <div className='flex gap-8 my-3'>
                    {/* Formato de la fase */}
                    <div className='flex-1'>
                      <TituloDeInput>Formato de la fase</TituloDeInput>
                      <SelectorSimple
                        opciones={[
                          { id: 'all-vs-all', texto: 'Todos contra todos' },
                          { id: 'elimination', texto: 'Eliminación directa' }
                        ]}
                        valorActual={phase.format}
                        alElegirOpcion={(id) =>
                          updatePhase(phase.id, {
                            format: id as Phase['format']
                          })
                        }
                        deshabilitado={!editable}
                      />
                    </div>

                    {/* Tipo de vuelta */}
                    <div className='flex-1'>
                      <TituloDeInput>Tipo de vuelta</TituloDeInput>
                      <SelectorSimple
                        opciones={[
                          { id: 'single', texto: 'Solo ida' },
                          { id: 'double', texto: 'Ida y vuelta' }
                        ]}
                        valorActual={phase.rounds}
                        alElegirOpcion={(id) =>
                          updatePhase(phase.id, {
                            rounds: id as Phase['rounds']
                          })
                        }
                        deshabilitado={!editable}
                      />
                    </div>
                  </div>
                  <div className='mt-8'>
                    <ReglasDeDesempate
                      tiebreakers={phase.tiebreakers}
                      editable={editable}
                      onReorder={(fromIndex: number, toIndex: number) =>
                        handleReorderTiebreakers(phase.id, fromIndex, toIndex)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Button type='button' onClick={addPhase} className='w-full'>
        <Plus className='w-4 h-4' />
        Agregar fase
      </Button>

      {data.phases.length > 0 && (
        <div className='p-3 bg-muted rounded-lg'>
          <p className='text-sm text-muted-foreground'>
            No hace falta que completes toda la información ahora mismo, siempre
            vas a poder editar la información de las fases y agregar nuevas.
          </p>
        </div>
      )}
    </div>
  )
}
