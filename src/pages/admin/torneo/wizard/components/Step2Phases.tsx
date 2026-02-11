import {
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  Pencil
} from 'lucide-react'
import { useState, useEffect } from 'react'
import type { TournamentWizardData, Phase } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Step2PhasesProps {
  data: TournamentWizardData
  updateData: (field: Partial<TournamentWizardData>) => void
}

export function Step2Phases({ data, updateData }: Step2PhasesProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [editingPhaseName, setEditingPhaseName] = useState<string | null>(null)
  const [draggedTiebreaker, setDraggedTiebreaker] = useState<{
    phaseId: string
    index: number
  } | null>(null)

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
      updateData({ phases: newPhases })
      setExpandedPhase(newPhases[0].id)
    }
  }

  const addPhase = () => {
    const phaseNumber = data.phases.length + 1
    const newPhase = createPhase(`Fase ${phaseNumber}`, 'all-vs-all')
    updateData({ phases: [...data.phases, newPhase] })
    setExpandedPhase(newPhase.id)
  }

  const removePhase = (id: string) => {
    if (data.phases.length > 1) {
      updateData({ phases: data.phases.filter((p) => p.id !== id) })
      if (expandedPhase === id) {
        setExpandedPhase(null)
      }
    }
  }

  const updatePhase = (id: string, field: Partial<Phase>) => {
    updateData({
      phases: data.phases.map((p) => (p.id === id ? { ...p, ...field } : p))
    })
  }

  const handleDragTiebreaker = (
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

  const handleDragStart = (phaseId: string, index: number) => {
    setDraggedTiebreaker({ phaseId, index })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (phaseId: string, dropIndex: number) => {
    if (!draggedTiebreaker || draggedTiebreaker.phaseId !== phaseId) return
    handleDragTiebreaker(phaseId, draggedTiebreaker.index, dropIndex)
    setDraggedTiebreaker(null)
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
          <strong>Importante:</strong> Los equipos, zonas y fixture que
          configures en los siguientes pasos corresponden solo a la fase actual,
          no a todo el torneo.
        </p>
      </div>

      <div className='space-y-2'>
        {data.phases.map((phase, phaseIndex) => {
          const editable = isPhaseEditable(phaseIndex)
          const previousPhaseCompleted =
            phaseIndex === 0 || data.phases[phaseIndex - 1]?.completed

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
                  <span className='w-6 h-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-sm'>
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
                      className='w-48'
                    />
                  ) : (
                    <span className='font-semibold text-foreground'>
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
                <div className='p-4 space-y-4'>
                  {!editable && (
                    <div className='p-3 bg-amber-50 rounded-lg border border-amber-200'>
                      <p className='text-sm text-foreground'>
                        La edición de esta fase se habilitará una vez finalizada
                        la anterior
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className='mb-2'>Formato de la fase</Label>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant={
                          phase.format === 'all-vs-all'
                            ? 'default'
                            : 'secondary'
                        }
                        className='flex-1'
                        onClick={() =>
                          editable &&
                          updatePhase(phase.id, { format: 'all-vs-all' })
                        }
                        disabled={!editable}
                      >
                        Todos contra todos
                      </Button>
                      <Button
                        type='button'
                        variant={
                          phase.format === 'elimination'
                            ? 'default'
                            : 'secondary'
                        }
                        className='flex-1'
                        onClick={() =>
                          editable &&
                          updatePhase(phase.id, { format: 'elimination' })
                        }
                        disabled={!editable}
                      >
                        Eliminación directa
                      </Button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                    <p className='text-sm font-medium'>Tipo de vuelta</p>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          phase.rounds === 'single' ? 'default' : 'outline'
                        }
                        onClick={() =>
                          editable &&
                          updatePhase(phase.id, { rounds: 'single' })
                        }
                        disabled={!editable}
                      >
                        Solo ida
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant={
                          phase.rounds === 'double' ? 'default' : 'outline'
                        }
                        onClick={() =>
                          editable &&
                          updatePhase(phase.id, { rounds: 'double' })
                        }
                        disabled={!editable}
                      >
                        Ida y vuelta
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className='mb-2'>Reglas de desempate</Label>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Arrastra para ordenar por prioridad
                    </p>
                    <div className='space-y-1.5'>
                      {phase.tiebreakers.map((rule, index) => (
                        <div
                          key={index}
                          draggable={editable}
                          onDragStart={() =>
                            editable && handleDragStart(phase.id, index)
                          }
                          onDragOver={handleDragOver}
                          onDrop={() =>
                            editable && handleDrop(phase.id, index)
                          }
                          className={cn(
                            'flex items-center gap-2 p-2 bg-muted rounded-lg border transition-colors',
                            editable
                              ? 'cursor-move hover:bg-accent'
                              : 'cursor-not-allowed'
                          )}
                        >
                          <GripVertical className='w-4 h-4 text-muted-foreground' />
                          <span className='w-5 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold'>
                            {index + 1}
                          </span>
                          <span className='text-sm font-medium'>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'p-4 rounded-xl border',
                      phaseIndex >= 1 && previousPhaseCompleted
                        ? 'bg-background'
                        : 'bg-muted'
                    )}
                  >
                    <h4
                      className={cn(
                        'font-semibold mb-1',
                        phaseIndex >= 1 && previousPhaseCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      Reglas de clasificación y avance
                    </h4>
                    {phaseIndex >= 1 && previousPhaseCompleted ? (
                      <p className='text-sm text-muted-foreground'>
                        Configuración disponible para definir los equipos
                        clasificados de la fase anterior
                      </p>
                    ) : (
                      <div className='flex items-center justify-center py-6'>
                        <span className='text-sm font-medium text-muted-foreground'>
                          {phaseIndex === 0
                            ? 'Disponible a partir de la segunda fase'
                            : 'Completa la fase anterior primero'}
                        </span>
                      </div>
                    )}
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
