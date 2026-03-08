import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { MiniResumen } from './mini-resumen'
import { Button } from '@/design-system/base-ui/button'
import { Input } from '@/design-system/base-ui/input'
import { Pencil, Plus, Shuffle, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import type { DatosWizardTorneo, EquipoWizard, Zona } from '../tipos'

export function Paso4Zonas() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<DatosWizardTorneo>()
  const ID_ZONA_SIN_ASIGNAR = '__sin_asignar__'
  const [editandoZonaId, setEditandoZonaId] = useState<string | null>(null)
  const [equipoArrastrado, setEquipoArrastrado] = useState<{
    equipo: EquipoWizard
    desdeZonaId: string
  } | null>(null)

  const datos = {
    nombre: watch('nombre'),
    fases: watch('fases'),
    indiceFaseActual: watch('indiceFaseActual'),
    equiposSeleccionados: watch('equiposSeleccionados'),
    zonas: watch('zonas'),
    prevenirMismoClub: watch('prevenirMismoClub')
  }

  const cantidadZonas = datos.zonas.length

  const faseActual = datos.fases[datos.indiceFaseActual]

  useEffect(() => {
    if (datos.zonas.length === 0) {
      setValue('zonas', [
        {
          id: `zona-${Date.now()}`,
          nombre: 'Zona A',
          equipos: [],
          idFase: faseActual?.id || '',
          fechasLibres: 0,
          fechasInterzonales: 0
        }
      ])
    }
  }, [datos.zonas.length, faseActual?.id, setValue])

  useEffect(() => {
    setValue('cantidadZonas', datos.zonas.length)
  }, [datos.zonas.length, setValue])

  useEffect(() => {
    const necesitaMigracion = datos.zonas.some(
      (z) =>
        (z as Zona & { fechasLibres?: number; fechasInterzonales?: number })
          .fechasLibres === undefined ||
        (z as Zona & { fechasLibres?: number; fechasInterzonales?: number })
          .fechasInterzonales === undefined
    )
    if (necesitaMigracion) {
      setValue(
        'zonas',
        datos.zonas.map((z) => ({
          ...z,
          fechasLibres:
            (z as Zona & { fechasLibres?: number }).fechasLibres ?? 0,
          fechasInterzonales:
            (z as Zona & { fechasInterzonales?: number }).fechasInterzonales ??
            0
        }))
      )
    }
  }, [datos.zonas])

  const agregarZona = () => {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const nuevaZona: Zona = {
      id: `zona-${Date.now()}`,
      nombre: `Zona ${letras[cantidadZonas] || String(cantidadZonas + 1)}`,
      equipos: [],
      idFase: faseActual?.id || '',
      fechasLibres: 0,
      fechasInterzonales: 0
    }
    setValue('zonas', [...datos.zonas, nuevaZona])
  }

  const quitarZona = (zonaId: string) => {
    if (cantidadZonas <= 1) return
    setValue(
      'zonas',
      datos.zonas.filter((z) => z.id !== zonaId)
    )
    if (editandoZonaId === zonaId) setEditandoZonaId(null)
  }

  const sortearEquipos = () => {
    if (datos.zonas.length === 0) return

    const mezclados = [...datos.equiposSeleccionados].sort(
      () => Math.random() - 0.5
    )
    const equiposPorZona = Math.ceil(mezclados.length / cantidadZonas)

    const nuevasZonas = datos.zonas.map((zona, indice) => {
      const inicio = indice * equiposPorZona
      const fin = inicio + equiposPorZona
      let equiposZona = mezclados.slice(inicio, fin)

      if (datos.prevenirMismoClub) {
        equiposZona = equiposZona.filter((equipo, idx, arr) => {
          const tieneIgualClub = arr.some(
            (t, i) => i !== idx && t.club === equipo.club
          )
          return !tieneIgualClub
        })
      }

      return { ...zona, equipos: equiposZona }
    })

    setValue('zonas', nuevasZonas)
  }

  const alIniciarArrastre = (equipo: EquipoWizard, zonaId: string) => {
    setEquipoArrastrado({ equipo, desdeZonaId: zonaId })
  }

  const alArrastrarSobre = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const alSoltar = (zonaObjetivoId: string) => {
    if (!equipoArrastrado) return

    const { equipo, desdeZonaId } = equipoArrastrado

    if (datos.prevenirMismoClub) {
      const zonaObjetivo = datos.zonas.find((z) => z.id === zonaObjetivoId)
      const tieneIgualClub = zonaObjetivo?.equipos.some(
        (t) => t.club === equipo.club
      )

      if (tieneIgualClub && desdeZonaId !== zonaObjetivoId) {
        toast.warning(
          `No se puede ubicar este equipo en esta zona porque ya hay un equipo del mismo club (${equipo.club})`
        )
        setEquipoArrastrado(null)
        return
      }
    }

    const nuevasZonas = datos.zonas.map((zona) => {
      if (zona.id === desdeZonaId) {
        return {
          ...zona,
          equipos: zona.equipos.filter((t) => t.id !== equipo.id)
        }
      }
      if (zona.id === zonaObjetivoId) {
        return { ...zona, equipos: [...zona.equipos, equipo] }
      }
      return zona
    })

    setValue('zonas', nuevasZonas)
    setEquipoArrastrado(null)
  }

  const actualizarZona = (zonaId: string, campo: Partial<Zona>) => {
    setValue(
      'zonas',
      datos.zonas.map((z) => (z.id === zonaId ? { ...z, ...campo } : z))
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
          <Button type='button' onClick={sortearEquipos}>
            <Shuffle className='w-4 h-4' />
            Sortear
          </Button>
          <CajitaConTick
            id='prevenir-mismo-club'
            checked={datos.prevenirMismoClub}
            onCheckedChange={(checked) =>
              setValue('prevenirMismoClub', checked)
            }
            label='Evitar equipos del mismo club en la misma zona'
          />
        </div>

        {errors.zonas && (
          <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg mb-4'>
            <p className='text-sm text-destructive'>{errors.zonas.message}</p>
          </div>
        )}

        <div className='flex justify-end mb-3'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={agregarZona}
            className='text-muted-foreground hover:text-foreground'
          >
            <Plus className='w-4 h-4' />
            Agregar zona
          </Button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {datos.zonas.map((zona) => (
            <div
              key={zona.id}
              onDragOver={alArrastrarSobre}
              onDrop={() => alSoltar(zona.id)}
              className='bg-muted rounded-xl p-4 border-2 border-dashed min-h-[300px]'
            >
              <div className='flex items-center justify-between mb-4 gap-2'>
                {editandoZonaId === zona.id ? (
                  <Input
                    type='text'
                    value={zona.nombre}
                    onChange={(e) =>
                      actualizarZona(zona.id, { nombre: e.target.value })
                    }
                    onBlur={() => setEditandoZonaId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditandoZonaId(null)
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className='flex-1 min-w-0'
                  />
                ) : (
                  <>
                    <h4
                      className='font-bold cursor-pointer hover:text-primary transition-colors flex-1 min-w-0'
                      onClick={() => setEditandoZonaId(zona.id)}
                    >
                      {zona.nombre}
                    </h4>
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditandoZonaId(zona.id)
                      }}
                      role='button'
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditandoZonaId(zona.id)
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
                    quitarZona(zona.id)
                  }}
                  disabled={cantidadZonas <= 1}
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>

              <div className='text-xs text-muted-foreground mb-3'>
                {zona.equipos.length} equipo
                {zona.equipos.length !== 1 ? 's' : ''}
              </div>

              <div className='space-y-2'>
                {zona.equipos.map((equipo) => (
                  <div
                    key={equipo.id}
                    draggable
                    onDragStart={() => alIniciarArrastre(equipo, zona.id)}
                    className='bg-background p-3 rounded-lg shadow-sm border cursor-move hover:shadow-md hover:border-primary/30 transition-all'
                  >
                    <div className='font-medium text-sm'>{equipo.nombre}</div>
                    <div className='text-xs text-muted-foreground mt-1'>
                      {equipo.club}
                    </div>
                  </div>
                ))}

                {zona.equipos.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground text-sm'>
                    Arrastra equipos aquí
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {datos.zonas.length > 0 &&
          datos.equiposSeleccionados.length >
            datos.zonas.reduce((acc, z) => acc + z.equipos.length, 0) && (
            <div className='mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200'>
              <h4 className='font-bold mb-3'>Equipos sin asignar</h4>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                {datos.equiposSeleccionados
                  .filter(
                    (equipo) =>
                      !datos.zonas.some((zona) =>
                        zona.equipos.some((t) => t.id === equipo.id)
                      )
                  )
                  .map((equipo) => (
                    <div
                      key={equipo.id}
                      draggable
                      onDragStart={() =>
                        alIniciarArrastre(equipo, ID_ZONA_SIN_ASIGNAR)
                      }
                      className='bg-background p-2 rounded-lg shadow-sm border text-sm cursor-move hover:shadow-md hover:border-primary/30 transition-all'
                    >
                      <div className='font-medium'>{equipo.nombre}</div>
                      <div className='text-xs text-muted-foreground'>
                        {equipo.club}
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
