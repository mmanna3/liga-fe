import { Checkbox } from '@/design-system/base-ui/checkbox'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { cn } from '@/logica-compartida/utils'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { equiposMock } from '../data/equipos-mock'
import type { DatosWizardTorneo, EquipoWizard } from '../tipos'
import { MiniResumen } from './mini-resumen'
import { TablaEquipos } from './tabla-equipos-paso-3'

export function Paso3Equipos() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<DatosWizardTorneo>()
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [seleccionarTodos, setSeleccionarTodos] = useState(false)

  const datos = {
    nombre: watch('nombre'),
    fases: watch('fases'),
    cantidadEquipos: watch('cantidadEquipos'),
    equiposSeleccionados: watch('equiposSeleccionados'),
    modoBusqueda: watch('modoBusqueda'),
    filtroAnio: watch('filtroAnio'),
    filtroTipo: watch('filtroTipo'),
    filtroTorneo: watch('filtroTorneo'),
    filtroFase: watch('filtroFase'),
    filtroZona: watch('filtroZona')
  }

  const alCambiarBusqueda = (valor: string) => {
    setTerminoBusqueda(valor)
    setSeleccionarTodos(false)
  }

  const alCambiarFiltro = (campo: Partial<DatosWizardTorneo>) => {
    Object.entries(campo).forEach(([clave, valor]) => {
      setValue(clave as keyof DatosWizardTorneo, valor)
    })
    setSeleccionarTodos(false)
  }

  const zonas = Array.from(
    new Set(equiposMock.map((t) => t.zona).filter(Boolean))
  ).sort() as string[]
  const torneos = Array.from(new Set(equiposMock.map((t) => t.torneo))).sort()

  const equiposFiltrados = equiposMock.filter((equipo) => {
    if (datos.modoBusqueda === 'nombre') {
      const coincideBusqueda =
        equipo.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        equipo.club.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        equipo.id.toString().includes(terminoBusqueda)
      const noSeleccionado = !datos.equiposSeleccionados.find(
        (t) => t.id === equipo.id
      )
      return coincideBusqueda && noSeleccionado
    } else {
      const coincideBusqueda =
        equipo.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        equipo.club.toLowerCase().includes(terminoBusqueda.toLowerCase())
      const coincideAnio = !datos.filtroAnio || equipo.anio === datos.filtroAnio
      const coincideTipo = !datos.filtroTipo || equipo.tipo === datos.filtroTipo
      const coincideTorneo =
        !datos.filtroTorneo || equipo.torneo === datos.filtroTorneo
      const coincideFase = !datos.filtroFase || equipo.fase === datos.filtroFase
      const coincideZona = !datos.filtroZona || equipo.zona === datos.filtroZona
      const noSeleccionado = !datos.equiposSeleccionados.find(
        (t) => t.id === equipo.id
      )

      return (
        coincideBusqueda &&
        coincideAnio &&
        coincideTipo &&
        coincideTorneo &&
        coincideFase &&
        coincideZona &&
        noSeleccionado
      )
    }
  })

  const alSeleccionarEquipo = (equipo: EquipoWizard) => {
    if (datos.equiposSeleccionados.length < datos.cantidadEquipos) {
      setValue('equiposSeleccionados', [...datos.equiposSeleccionados, equipo])
    }
  }

  const alQuitarEquipo = (equipoId: number) => {
    setValue(
      'equiposSeleccionados',
      datos.equiposSeleccionados.filter((t) => t.id !== equipoId)
    )
  }

  const alSeleccionarTodos = () => {
    if (seleccionarTodos) {
      setSeleccionarTodos(false)
    } else {
      const restantes =
        datos.cantidadEquipos - datos.equiposSeleccionados.length
      const equiposAgregar = equiposFiltrados.slice(0, restantes)
      setValue('equiposSeleccionados', [
        ...datos.equiposSeleccionados,
        ...equiposAgregar
      ])
      setSeleccionarTodos(true)
    }
  }

  return (
    <div className='space-y-4'>
      <MiniResumen />

      <div className='flex items-center gap-4'>
        <div>
          <Label className='block mb-1 text-md font-semibold'>Equipos</Label>
          <Input
            type='number'
            value={datos.cantidadEquipos}
            onChange={(e) => {
              const cantidad = parseInt(e.target.value, 10) || 0
              setValue('cantidadEquipos', cantidad)
              setValue(
                'equiposSeleccionados',
                datos.equiposSeleccionados.slice(0, cantidad)
              )
            }}
            min={2}
            className='font-semibold w-20 h-11'
          />
        </div>
        <div className='flex items-center gap-2 flex-1 min-w-0 mt-6'>
          <span className='text-sm font-medium'>
            Seleccionados: {datos.equiposSeleccionados.length} /{' '}
            {datos.cantidadEquipos}
          </span>
          <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full transition-all duration-300',
                datos.equiposSeleccionados.length === datos.cantidadEquipos
                  ? 'bg-primary'
                  : 'bg-amber-500'
              )}
              style={{
                width: `${(datos.equiposSeleccionados.length / datos.cantidadEquipos) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {errors.equiposSeleccionados && (
        <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg'>
          <p className='text-sm text-destructive'>
            {errors.equiposSeleccionados.message}
          </p>
        </div>
      )}

      {datos.equiposSeleccionados.length > 0 && (
        <div className='bg-muted rounded-xl p-4'>
          <h4 className='text-sm font-semibold mb-3'>Equipos seleccionados</h4>
          <div className='flex flex-wrap gap-2'>
            {datos.equiposSeleccionados.map((equipo) => (
              <div
                key={equipo.id}
                className='flex items-center gap-2 bg-background px-3 py-2 rounded-lg shadow-sm'
              >
                <span className='text-sm font-medium'>{equipo.nombre}</span>
                <button
                  type='button'
                  onClick={() => alQuitarEquipo(equipo.id)}
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
        <Label className='block mb-2 text-md font-semibold'>
          Búsqueda de equipo
        </Label>
        <SelectorSimple
          opciones={[
            { id: 'nombre', texto: 'Por Nombre/Código' },
            { id: 'torneo', texto: 'Desde otro torneo' }
          ]}
          valorActual={datos.modoBusqueda}
          alElegirOpcion={(id) =>
            setValue('modoBusqueda', id as DatosWizardTorneo['modoBusqueda'])
          }
          className='mb-4'
        />

        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <Input
            type='text'
            value={terminoBusqueda}
            onChange={(e) => alCambiarBusqueda(e.target.value)}
            placeholder={
              datos.modoBusqueda === 'nombre'
                ? 'Buscar por nombre o código...'
                : 'Buscar equipos...'
            }
            className='pl-10'
          />
        </div>

        {datos.modoBusqueda === 'torneo' && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4'>
            <div>
              <Label className='block mb-2 text-md font-semibold'>Año</Label>
              <select
                value={datos.filtroAnio}
                onChange={(e) =>
                  alCambiarFiltro({ filtroAnio: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todos los años</option>
                <option value='2026'>2026</option>
                <option value='2025'>2025</option>
              </select>
            </div>

            <div>
              <Label className='block mb-2 text-md font-semibold'>Tipo</Label>
              <select
                value={datos.filtroTipo}
                onChange={(e) =>
                  alCambiarFiltro({ filtroTipo: e.target.value })
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
              <Label className='block mb-2 text-md font-semibold'>Torneo</Label>
              <select
                value={datos.filtroTorneo}
                onChange={(e) =>
                  alCambiarFiltro({ filtroTorneo: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todos los torneos</option>
                {torneos.map((torneo) => (
                  <option key={torneo} value={torneo}>
                    {torneo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className='block mb-2 text-md font-semibold'>Fase</Label>
              <select
                value={datos.filtroFase}
                onChange={(e) =>
                  alCambiarFiltro({ filtroFase: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todas las fases</option>
                <option value='Apertura'>Apertura</option>
                <option value='Clausura'>Clausura</option>
              </select>
            </div>

            <div>
              <Label className='block mb-2 text-md font-semibold'>Zona</Label>
              <select
                value={datos.filtroZona}
                onChange={(e) =>
                  alCambiarFiltro({ filtroZona: e.target.value })
                }
                className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'
              >
                <option value=''>Todas las zonas</option>
                {zonas.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
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
          {equiposFiltrados.length > 0 &&
            datos.equiposSeleccionados.length < datos.cantidadEquipos && (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='seleccionar-todos'
                  checked={seleccionarTodos}
                  onCheckedChange={() => alSeleccionarTodos()}
                />
                <Label
                  htmlFor='seleccionar-todos'
                  className='mb-0 text-xs cursor-pointer'
                >
                  {seleccionarTodos
                    ? 'Deseleccionar todos'
                    : 'Seleccionar todos'}
                </Label>
              </div>
            )}
        </div>
        <div className='max-h-96 overflow-y-auto'>
          <TablaEquipos
            equipos={equiposFiltrados}
            mostrarColumnasTorneo={datos.modoBusqueda === 'torneo'}
            cantidadEquipos={datos.cantidadEquipos}
            cantidadSeleccionados={datos.equiposSeleccionados.length}
            alSeleccionarEquipo={alSeleccionarEquipo}
          />
        </div>
      </div>
    </div>
  )
}
