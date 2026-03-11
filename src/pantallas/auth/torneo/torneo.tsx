import { api } from '@/api/api'
import type { TorneoDTO } from '@/api/clients'
import { Card, CardContent } from '@/design-system/base-ui/card'
import { Label } from '@/design-system/base-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TorneoCard from './components/torneo-card'

function obtenerAniosUnicos(torneos: TorneoDTO[]): number[] {
  const anios = [...new Set(torneos.map((t) => t.anio))]
  return anios.sort((a, b) => b - a)
}

const VALOR_TODOS = 'todos'

function obtenerAgrupadoresUnicos(torneos: TorneoDTO[]): string[] {
  const nombres = torneos.map(
    (t) => t.torneoAgrupadorNombre?.trim() || 'Sin agrupador'
  )
  const unicos = [...new Set(nombres)]
  return unicos.sort((a, b) => a.localeCompare(b))
}

export default function Torneo() {
  const navigate = useNavigate()
  const anioActual = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(
    String(anioActual)
  )
  const [agrupadorSeleccionado, setAgrupadorSeleccionado] =
    useState<string>(VALOR_TODOS)

  const {
    data: torneos = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const response = await api.torneoAll()
      return response
    }
  })

  const aniosDisponibles = useMemo(() => obtenerAniosUnicos(torneos), [torneos])
  const anioPorDefecto = useMemo(
    () =>
      aniosDisponibles.includes(anioActual)
        ? anioActual
        : (aniosDisponibles[0] ?? anioActual),
    [aniosDisponibles, anioActual]
  )
  const anioEfectivo =
    aniosDisponibles.length > 0 &&
    !aniosDisponibles.includes(Number(anioSeleccionado))
      ? anioPorDefecto
      : Number(anioSeleccionado)

  const torneosPorAnio = useMemo(
    () => torneos.filter((t) => t.anio === anioEfectivo),
    [torneos, anioEfectivo]
  )

  const agrupadoresDisponibles = useMemo(
    () => obtenerAgrupadoresUnicos(torneosPorAnio),
    [torneosPorAnio]
  )

  const agrupadorEfectivo =
    agrupadorSeleccionado === VALOR_TODOS ||
    agrupadoresDisponibles.includes(agrupadorSeleccionado)
      ? agrupadorSeleccionado
      : VALOR_TODOS

  const torneosFiltrados = useMemo(() => {
    if (agrupadorEfectivo === VALOR_TODOS) return torneosPorAnio
    if (agrupadorEfectivo === 'Sin agrupador') {
      return torneosPorAnio.filter((t) => !t.torneoAgrupadorNombre?.trim())
    }
    return torneosPorAnio.filter(
      (t) => (t.torneoAgrupadorNombre?.trim() || '') === agrupadorEfectivo
    )
  }, [torneosPorAnio, agrupadorEfectivo])

  const opcionesAnio = useMemo(
    () =>
      (aniosDisponibles.length > 0 ? aniosDisponibles : [anioActual]).map(
        (anio) => ({
          id: String(anio),
          titulo: String(anio)
        })
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
                <div className='space-y-2 sm:min-w-[140px]'>
                  <Label>Año</Label>
                  <Select
                    value={String(anioEfectivo)}
                    onValueChange={setAnioSeleccionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar año' />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesAnio.map((opcion) => (
                        <SelectItem key={opcion.id} value={opcion.id}>
                          {opcion.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2 sm:min-w-[200px]'>
                  <Label>Agrupador</Label>
                  <Select
                    value={agrupadorEfectivo}
                    onValueChange={setAgrupadorSeleccionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Seleccionar agrupador' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VALOR_TODOS}>Todos</SelectItem>
                      {agrupadoresDisponibles.map((agrupador) => (
                        <SelectItem key={agrupador} value={agrupador}>
                          {agrupador}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='min-h-[120px]'>
            {isLoading ? (
              <p className='text-muted-foreground'>Cargando torneos...</p>
            ) : isError ? (
              <p className='text-destructive'>Error al cargar los torneos</p>
            ) : torneosFiltrados.length === 0 ? (
              <p className='text-muted-foreground ml-2'>
                No hay torneos para el año seleccionado
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {torneosFiltrados.map((torneo) => (
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
