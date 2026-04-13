import { api } from '@/api/api'
import type { TorneoDTO } from '@/api/clients'
import { Card, CardContent } from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import { rutasNavegacion } from '@/ruteo/rutas'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TorneoCard from './components/torneo-card'

function obtenerRangoAnios(anioActual: number): number[] {
  const desde = anioActual - 20
  const hasta = anioActual + 1
  const anios: number[] = []
  for (let a = hasta; a >= desde; a--) anios.push(a)
  return anios
}

const VALOR_TODOS = 'todos'
const VALOR_SIN_AGRUPADOR = 'sin-agrupador'

const VISIBILIDAD_TODOS = 'todos'
const VISIBILIDAD_VISIBLES_EN_APP = 'visibles-en-app'
const VISIBILIDAD_NO_VISIBLES_EN_APP = 'no-visibles-en-app'

interface AgrupadorOpcion {
  id: string
  nombre: string
}

function obtenerAgrupadoresConId(torneos: TorneoDTO[]): AgrupadorOpcion[] {
  const mapa = new Map<string, string>()
  for (const t of torneos) {
    const nombre = t.torneoAgrupadorNombre?.trim() || 'Sin agrupador'
    const id =
      nombre === 'Sin agrupador'
        ? VALOR_SIN_AGRUPADOR
        : String(t.torneoAgrupadorId ?? '')
    if (id && !mapa.has(id)) mapa.set(id, nombre)
  }
  return Array.from(mapa.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export default function Torneo() {
  const navigate = useNavigate()
  const anioActual = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(
    String(anioActual)
  )
  const [agrupadorSeleccionado, setAgrupadorSeleccionado] =
    useState<string>(VALOR_TODOS)
  const [visibilidadEnApp, setVisibilidadEnApp] =
    useState<string>(VISIBILIDAD_TODOS)

  const aniosDisponibles = useMemo(
    () => obtenerRangoAnios(anioActual),
    [anioActual]
  )
  const anioEfectivo = aniosDisponibles.includes(Number(anioSeleccionado))
    ? Number(anioSeleccionado)
    : anioActual

  const agrupadorIdParaApi =
    agrupadorSeleccionado === VALOR_TODOS ||
    agrupadorSeleccionado === VALOR_SIN_AGRUPADOR
      ? undefined
      : Number(agrupadorSeleccionado)

  const { data: torneosPorAnio = [] } = useQuery({
    queryKey: ['torneos', 'filtrar', anioEfectivo, undefined],
    queryFn: () => api.torneosFiltrar(anioEfectivo, undefined),
    enabled: anioEfectivo > 0
  })

  const {
    data: torneosFiltrados = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['torneos', 'filtrar', anioEfectivo, agrupadorIdParaApi],
    queryFn: () => api.torneosFiltrar(anioEfectivo, agrupadorIdParaApi),
    enabled: anioEfectivo > 0
  })

  const agrupadoresDisponibles = useMemo(
    () => obtenerAgrupadoresConId(torneosPorAnio),
    [torneosPorAnio]
  )

  const agrupadorEfectivo =
    agrupadorSeleccionado === VALOR_TODOS ||
    agrupadoresDisponibles.some((a) => a.id === agrupadorSeleccionado)
      ? agrupadorSeleccionado
      : VALOR_TODOS

  const torneosTrasAgrupador = useMemo(() => {
    if (agrupadorEfectivo === VALOR_SIN_AGRUPADOR) {
      return torneosFiltrados.filter((t) => !t.torneoAgrupadorId)
    }
    return torneosFiltrados
  }, [torneosFiltrados, agrupadorEfectivo])

  const torneosAMostrar = useMemo(() => {
    if (visibilidadEnApp === VISIBILIDAD_TODOS) return torneosTrasAgrupador
    if (visibilidadEnApp === VISIBILIDAD_VISIBLES_EN_APP) {
      return torneosTrasAgrupador.filter((t) => t.esVisibleEnApp)
    }
    return torneosTrasAgrupador.filter((t) => !t.esVisibleEnApp)
  }, [torneosTrasAgrupador, visibilidadEnApp])

  const opcionesAnio = useMemo(
    () =>
      (aniosDisponibles.length > 0 ? aniosDisponibles : [anioActual]).map(
        (anio) => ({ value: String(anio), label: String(anio) })
      ),
    [aniosDisponibles, anioActual]
  )

  return (
    <FlujoHomeLayout
      titulo='Torneos'
      iconoTitulo='Torneos'
      ocultarBotonVolver
      contenedorClassName='max-w-6xl'
      contenidoEnCard={false}
      botonera={{
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.agrupadoresTorneo),
            tooltip: 'Agrupadores de torneos',
            icono: 'Layout dashboard',
            visibleSoloParaAdmin: true
          },
          {
            alApretar: () => navigate(rutasNavegacion.crearTorneo),
            tooltip: 'Crear Torneo',
            icono: 'Agregar',
            visibleSoloParaAdmin: true
          }
        ]
      }}
      contenido={
        <div className='flex flex-col gap-4'>
          <Card className='shadow-md'>
            <CardContent className='pt-4'>
              <div className='flex flex-col gap-4 sm:flex-row sm:gap-6'>
                <ListaDesplegable
                  titulo='Año'
                  opciones={opcionesAnio}
                  valor={String(anioEfectivo)}
                  alCambiar={setAnioSeleccionado}
                  placeholder='Seleccionar año'
                  className='sm:min-w-[140px]'
                />
                <ListaDesplegable
                  titulo='Agrupador'
                  opciones={[
                    { value: VALOR_TODOS, label: 'Todos' },
                    ...agrupadoresDisponibles.map((a) => ({
                      value: a.id,
                      label: a.nombre
                    }))
                  ]}
                  valor={agrupadorEfectivo}
                  alCambiar={setAgrupadorSeleccionado}
                  placeholder='Seleccionar agrupador'
                  className='sm:min-w-[200px]'
                />
                <ListaDesplegable
                  titulo='Es visible en app'
                  opciones={[
                    { value: VISIBILIDAD_TODOS, label: 'Todos' },
                    {
                      value: VISIBILIDAD_VISIBLES_EN_APP,
                      label: 'Visibles en app'
                    },
                    {
                      value: VISIBILIDAD_NO_VISIBLES_EN_APP,
                      label: 'No visibles en app'
                    }
                  ]}
                  valor={visibilidadEnApp}
                  alCambiar={setVisibilidadEnApp}
                  placeholder='Visibilidad'
                  className='sm:min-w-[200px]'
                />
              </div>
            </CardContent>
          </Card>

          <div className='min-h-[120px]'>
            {isLoading ? (
              <p className='text-muted-foreground'>Cargando torneos...</p>
            ) : isError ? (
              <p className='text-destructive'>Error al cargar los torneos</p>
            ) : torneosAMostrar.length === 0 ? (
              <MensajeListaVacia mensaje='No hay torneos para los filtros seleccionados' />
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {torneosAMostrar.map((torneo) => (
                  <TorneoCard key={torneo.id} torneo={torneo} />
                ))}
              </div>
            )}
          </div>
        </div>
      }
    />
  )
}
