import { Button } from '@/design-system/base-ui/button'
import { Input } from '@/design-system/base-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import TituloDeInput from '@/design-system/ykn-ui/titulo-de-input'
import { cn } from '@/logica-compartida/utils'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Fase, DatosWizardTorneo } from '../tipos'
import { MiniResumen } from './mini-resumen'
import { ReglasDeDesempate } from './reglas-de-desempate'

export function Paso2Fases() {
  const { watch, setValue } = useFormContext<DatosWizardTorneo>()
  const [faseExpandida, setFaseExpandida] = useState<string | null>(null)
  const [editandoNombreFase, setEditandoNombreFase] = useState<string | null>(
    null
  )

  const datos = {
    formato: watch('formato'),
    nombre: watch('nombre'),
    categorias: watch('categorias'),
    fases: watch('fases')
  }

  useEffect(() => {
    if (datos.formato && datos.fases.length === 0) {
      inicializarFasesParaFormato()
    }
  }, [datos.formato])

  const crearFase = (
    nombre: string,
    formato: 'all-vs-all' | 'elimination'
  ): Fase => ({
    id: Date.now().toString() + Math.random(),
    nombre,
    formato,
    vueltas: 'single',
    formatosPorZona: {},
    desempates: [
      'Diferencia de Goles',
      'Goles a Favor',
      'Resultado entre sí',
      'Sorteo',
      'Manual'
    ],
    modoTransicion: 'automatic',
    clasificadosPorZona: 2,
    posicionInicioClasificados: 1,
    posicionFinClasificados: 2,
    clasificadosCruzados: 0,
    modoComparacion: 'total-points',
    habilitarTriangular: false,
    resolucionDesempate: 'penalties',
    reglasTransicion: [
      'Diferencia de Goles',
      'Mejores de tabla general (Cross-Group)',
      'Sorteo'
    ],
    completada: false
  })

  const inicializarFasesParaFormato = () => {
    const nuevasFases: Fase[] = []

    if (datos.formato === 'ANUAL') {
      nuevasFases.push(crearFase('Apertura', 'all-vs-all'))
      nuevasFases.push(crearFase('Clausura', 'all-vs-all'))
    } else if (datos.formato === 'MUNDIAL') {
      nuevasFases.push(crearFase('Fase de grupos', 'all-vs-all'))
      nuevasFases.push(crearFase('Playoffs', 'elimination'))
    } else if (datos.formato === 'RELAMPAGO') {
      nuevasFases.push(crearFase('Eliminación directa', 'elimination'))
    } else if (datos.formato === 'PERSONALIZADO') {
      nuevasFases.push(crearFase('Fase 1', 'all-vs-all'))
    }

    if (nuevasFases.length > 0) {
      setValue('fases', nuevasFases)
      setFaseExpandida(nuevasFases[0].id)
    }
  }

  const agregarFase = () => {
    const numeroDeFase = datos.fases.length + 1
    const nuevaFase = crearFase(`Fase ${numeroDeFase}`, 'all-vs-all')
    setValue('fases', [...datos.fases, nuevaFase])
    setFaseExpandida(nuevaFase.id)
  }

  const quitarFase = (id: string) => {
    if (datos.fases.length > 1) {
      setValue(
        'fases',
        datos.fases.filter((p) => p.id !== id)
      )
      if (faseExpandida === id) {
        setFaseExpandida(null)
      }
    }
  }

  const actualizarFase = (id: string, campo: Partial<Fase>) => {
    setValue(
      'fases',
      datos.fases.map((p) => (p.id === id ? { ...p, ...campo } : p))
    )
  }

  const alReordenarDesempates = (
    faseId: string,
    desdeIndice: number,
    hastaIndice: number
  ) => {
    const fase = datos.fases.find((p) => p.id === faseId)
    if (!fase) return

    const nuevosDesempates = [...fase.desempates]
    const [movido] = nuevosDesempates.splice(desdeIndice, 1)
    nuevosDesempates.splice(hastaIndice, 0, movido)

    actualizarFase(faseId, { desempates: nuevosDesempates })
  }

  const obtenerEtiquetaFormato = (formato: 'all-vs-all' | 'elimination') =>
    formato === 'all-vs-all' ? 'Todos contra todos' : 'Eliminación directa'

  const obtenerEtiquetaVueltas = (vueltas: 'single' | 'double') =>
    vueltas === 'single' ? 'Solo ida' : 'Ida y vuelta'

  return (
    <div className='space-y-4'>
      <MiniResumen />

      <div className='p-3 bg-amber-50 rounded-lg border border-amber-200'>
        <p className='text-sm text-foreground'>
          <strong>Importante:</strong> En este paso, podés configurar los datos
          generales de todas las fases, pero en los pasos siguientes vas a
          elegir equipos, zonas y fixture SOLO de la primera. Luego de creado el
          torneo, vas a poder editar toda la información de todas las fases.
        </p>
      </div>

      <div className='space-y-2'>
        {datos.fases.map((fase, indiceFase) => {
          const editable = true

          return (
            <div
              key={fase.id}
              className={cn(
                'border rounded-xl overflow-hidden',
                !editable && 'opacity-60'
              )}
            >
              <div className='w-full px-4 py-3 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between'>
                <button
                  type='button'
                  onClick={() =>
                    setFaseExpandida(faseExpandida === fase.id ? null : fase.id)
                  }
                  className='flex items-center gap-3 flex-1'
                  disabled={!editable}
                >
                  {faseExpandida === fase.id ? (
                    <ChevronDown className='w-4 h-4 text-muted-foreground' />
                  ) : (
                    <ChevronRight className='w-4 h-4 text-muted-foreground' />
                  )}
                  <span className='w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-md'>
                    {indiceFase + 1}
                  </span>
                  {editandoNombreFase === fase.id && editable ? (
                    <Input
                      type='text'
                      value={fase.nombre}
                      onChange={(e) =>
                        actualizarFase(fase.id, { nombre: e.target.value })
                      }
                      onBlur={() => setEditandoNombreFase(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditandoNombreFase(null)
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className='w-48 text-sm'
                    />
                  ) : (
                    <span className='font-semibold text-foreground text-lg'>
                      {fase.nombre}
                    </span>
                  )}
                  {editable && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditandoNombreFase(fase.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditandoNombreFase(fase.id)
                      }}
                      role='button'
                      tabIndex={0}
                      className='p-1 hover:bg-accent rounded transition-colors cursor-pointer'
                    >
                      <Pencil className='w-3 h-3 text-muted-foreground' />
                    </span>
                  )}
                  <span className='text-sm text-muted-foreground'>
                    • {obtenerEtiquetaFormato(fase.formato)}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    • {obtenerEtiquetaVueltas(fase.vueltas)}
                  </span>
                </button>
                <div className='flex items-center gap-2'>
                  {datos.fases.length > 1 && editable && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                      onClick={(e) => {
                        e.stopPropagation()
                        quitarFase(fase.id)
                      }}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              </div>

              {faseExpandida === fase.id && (
                <div className='p-4 space-y-6'>
                  <div className='flex gap-8 my-3'>
                    {/* Formato de la fase */}
                    <div className='flex-1'>
                      <TituloDeInput>Formato de la fase</TituloDeInput>
                      <SelectorSimple
                        opciones={[
                          { id: 'all-vs-all', texto: 'Todos contra todos' },
                          { id: 'elimination', texto: 'Eliminación directa' }
                        ]}
                        valorActual={fase.formato}
                        alElegirOpcion={(id) =>
                          actualizarFase(fase.id, {
                            formato: id as Fase['formato']
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
                        valorActual={fase.vueltas}
                        alElegirOpcion={(id) =>
                          actualizarFase(fase.id, {
                            vueltas: id as Fase['vueltas']
                          })
                        }
                        deshabilitado={!editable}
                      />
                    </div>
                  </div>
                  {fase.formato === 'all-vs-all' && (
                    <div className='mt-8'>
                      <ReglasDeDesempate
                        desempates={fase.desempates}
                        editable={editable}
                        alReordenar={(
                          desdeIndice: number,
                          hastaIndice: number
                        ) =>
                          alReordenarDesempates(
                            fase.id,
                            desdeIndice,
                            hastaIndice
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Button type='button' onClick={agregarFase} className='w-full'>
        <Plus className='w-4 h-4' />
        Agregar fase
      </Button>
    </div>
  )
}
