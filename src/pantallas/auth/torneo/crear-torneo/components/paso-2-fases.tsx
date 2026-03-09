import { Input } from '@/design-system/base-ui/input'
import { Boton } from '@/design-system/ykn-ui/boton'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { TextoAyuda } from '@/design-system/ykn-ui/texto-ayuda'
import { cn } from '@/logica-compartida/utils'
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { DatosWizardTorneo, Fase } from '../tipos'
import { MiniResumen } from './mini-resumen'

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
    formato: 'todos-contra-todos' | 'eliminacion'
  ): Fase => ({
    id: Date.now().toString() + Math.random(),
    nombre,
    formato,
    vueltas: 'ida'
  })

  const inicializarFasesParaFormato = () => {
    const nuevasFases: Fase[] = []

    if (datos.formato === 'ANUAL') {
      nuevasFases.push(crearFase('Apertura', 'todos-contra-todos'))
      nuevasFases.push(crearFase('Clausura', 'todos-contra-todos'))
    } else if (datos.formato === 'MUNDIAL') {
      nuevasFases.push(crearFase('Fase de grupos', 'todos-contra-todos'))
      nuevasFases.push(crearFase('Playoffs', 'eliminacion'))
    } else if (datos.formato === 'RELAMPAGO') {
      nuevasFases.push(crearFase('Eliminación directa', 'eliminacion'))
    } else if (datos.formato === 'PERSONALIZADO') {
      nuevasFases.push(crearFase('Fase 1', 'todos-contra-todos'))
    }

    if (nuevasFases.length > 0) {
      setValue('fases', nuevasFases)
      setFaseExpandida(nuevasFases[0].id)
    }
  }

  const agregarFase = () => {
    const numeroDeFase = datos.fases.length + 1
    const nuevaFase = crearFase(`Fase ${numeroDeFase}`, 'todos-contra-todos')
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

  const obtenerEtiquetaFormato = (
    formato: 'todos-contra-todos' | 'eliminacion'
  ) =>
    formato === 'todos-contra-todos'
      ? 'Todos contra todos'
      : 'Eliminación directa'

  const obtenerEtiquetaVueltas = (vueltas: 'ida' | 'ida-y-vuelta') =>
    vueltas === 'ida' ? 'Solo ida' : 'Ida y vuelta'

  return (
    <div className='space-y-4'>
      <MiniResumen />

      <TextoAyuda>
        <strong>Importante:</strong> En este paso, podés configurar los datos
        generales de todas las fases, pero en los pasos siguientes vas a elegir
        equipos, zonas y fixture SOLO de la primera. Luego de creado el torneo,
        vas a poder editar toda la información de todas las fases.
      </TextoAyuda>

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
                    <Boton
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
                    </Boton>
                  )}
                </div>
              </div>

              {faseExpandida === fase.id && (
                <div className='p-4 space-y-6'>
                  <div className='flex gap-8 my-3'>
                    <SelectorSimple
                      titulo='Formato de la fase'
                      opciones={[
                        {
                          id: 'todos-contra-todos',
                          texto: 'Todos contra todos'
                        },
                        { id: 'eliminacion', texto: 'Eliminación directa' }
                      ]}
                      valorActual={fase.formato}
                      alElegirOpcion={(id) =>
                        actualizarFase(fase.id, {
                          formato: id as Fase['formato']
                        })
                      }
                      deshabilitado={!editable}
                    />
                    <SelectorSimple
                      titulo='Tipo de vuelta'
                      opciones={[
                        { id: 'ida', texto: 'Solo ida' },
                        { id: 'ida-y-vuelta', texto: 'Ida y vuelta' }
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
              )}
            </div>
          )
        })}
      </div>

      <Boton type='button' onClick={agregarFase} className='w-full'>
        <Plus className='w-4 h-4' />
        Agregar fase
      </Boton>
    </div>
  )
}
