import { Boton } from '@/design-system/ykn-ui/boton'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import Icono from '@/design-system/ykn-ui/icono'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import type { DatosWizardTorneo, EquipoWizard, Zona } from '../tipos'
import { TextoAyuda } from '@/design-system/ykn-ui/texto-ayuda'
import { EquiposSinAsignar } from './equipos-sin-asignar'
import { MiniResumen } from './mini-resumen'
import { ZonaConEquiposArrastrables } from './zona-con-equipos-arrastrables'

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

  const actualizarFechasZona = (
    zonaId: string,
    campo: { fechasLibres?: number; fechasInterzonales?: number }
  ) => {
    actualizarZona(zonaId, campo)
    setValue('fixtureGenerado', false)
  }

  const equiposSinAsignar = datos.equiposSeleccionados.filter(
    (equipo) =>
      !datos.zonas.some((zona) => zona.equipos.some((t) => t.id === equipo.id))
  )

  return (
    <div className='space-y-6'>
      <MiniResumen>
        <p className='text-xs text-muted-foreground mt-2'>
          Las zonas son específicas de esta fase
        </p>
      </MiniResumen>

      <div>
        <div className='flex flex-wrap items-center gap-3 mb-6'>
          <Boton type='button' onClick={sortearEquipos}>
            <Icono nombre='Sortear' className='w-4 h-4' />
            Sortear
          </Boton>
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
          <Boton
            type='button'
            variant='ghost'
            size='sm'
            onClick={agregarZona}
            className='text-muted-foreground hover:text-foreground'
          >
            <Plus className='w-4 h-4' />
            Agregar zona
          </Boton>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {datos.zonas.map((zona) => (
            <ZonaConEquiposArrastrables
              key={zona.id}
              zona={zona}
              editandoZonaId={editandoZonaId}
              setEditandoZonaId={setEditandoZonaId}
              cantidadZonas={cantidadZonas}
              alArrastrarSobre={alArrastrarSobre}
              alSoltar={() => alSoltar(zona.id)}
              onIniciarArrastre={alIniciarArrastre}
              onActualizarZona={actualizarZona}
              onActualizarFechasZona={actualizarFechasZona}
              onQuitarZona={quitarZona}
            />
          ))}
        </div>

        {datos.zonas.length > 0 && equiposSinAsignar.length > 0 && (
          <EquiposSinAsignar
            equipos={equiposSinAsignar}
            idZonaSinAsignar={ID_ZONA_SIN_ASIGNAR}
            onIniciarArrastre={alIniciarArrastre}
          />
        )}

        <div className='mt-6'>
          <TextoAyuda>
            Arrastrá y soltá los equipos entre zonas para organizarlos como
            prefieras
          </TextoAyuda>
        </div>
      </div>
    </div>
  )
}
