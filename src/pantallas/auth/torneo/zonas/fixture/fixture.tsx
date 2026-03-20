import { api } from '@/api/api'
import type { FixtureAlgoritmoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { FixtureAlgoritmosDisponiblesParaGenerar } from './fixture-algoritmos-disponibles-para-generar'
import { FixtureGeneracionListaEquipos } from './fixture-generacion-lista-equipos'
import { FixtureSelectorFecha } from './fixture-selector-fecha'
import { rutasNavegacion } from '@/ruteo/rutas'
import { DndContext } from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FechasZona } from './fechas-zona'
import { ResultadoFixture } from './resultado-fixture'
import type { ItemFixture } from './types'
import { toDateOnly } from '@/logica-compartida/utils'
import { useListaFixture } from './use-lista-fixture'

export default function Fixture() {
  const {
    id: torneoIdParam,
    faseId: faseIdParam,
    zonaId: zonaIdParam
  } = useParams<{ id: string; faseId: string; zonaId: string }>()
  const torneoId = Number(torneoIdParam)
  const faseId = Number(faseIdParam)
  const zonaId = Number(zonaIdParam)

  const { data: torneo } = useApiQuery({
    key: ['torneo', torneoId],
    fn: () => api.torneoGET(torneoId),
    activado: Number.isFinite(torneoId)
  })

  const { data: zonas = [] } = useApiQuery({
    key: ['zonasAll', faseId],
    fn: () => api.zonasAll(faseId),
    activado: Number.isFinite(faseId)
  })

  const { data: algoritmos = [] } = useApiQuery({
    key: ['fixtureAlgoritmoAll'],
    fn: () => api.fixtureAlgoritmoAll()
  })

  const { data: fechasExistentes = [] } = useApiQuery({
    key: ['fechasAll', zonaId],
    fn: () => api.fechasAll(zonaId),
    activado: Number.isFinite(zonaId)
  })

  const fase = useMemo(
    () => torneo?.fases?.find((f) => f.id === faseId),
    [torneo, faseId]
  )

  const zona = useMemo(
    () => zonas.find((z) => z.id === zonaId),
    [zonas, zonaId]
  )

  const { listaOrdenada, sensors, handleDragEnd } = useListaFixture(
    zona?.equipos ?? []
  )

  const cantidadEquipos = listaOrdenada.length

  const [algoritmoSeleccionado, setAlgoritmoSeleccionado] = useState<
    FixtureAlgoritmoDTO | undefined
  >(undefined)

  useEffect(() => {
    const match = algoritmos.filter(
      (a) => a.cantidadDeEquipos === cantidadEquipos
    )
    if (match.length === 0) {
      setAlgoritmoSeleccionado(undefined)
      setListaFijada(null)
    } else {
      setAlgoritmoSeleccionado((prev) => {
        const stillValid =
          prev != null &&
          match.some(
            (a) =>
              (a.id ?? a.fixtureAlgoritmoId) ===
              (prev!.id ?? prev!.fixtureAlgoritmoId)
          )
        return stillValid ? prev : match[0]
      })
    }
  }, [algoritmos, cantidadEquipos])

  const [listaFijada, setListaFijada] = useState<ItemFixture[] | null>(null)
  const [primeraFecha, setPrimeraFecha] = useState<Date>(() =>
    toDateOnly(new Date())
  )

  function handleGenerarFixture() {
    setListaFijada(listaOrdenada)
  }

  const pathVolver = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`
  const subtitulo = [
    torneo?.nombre ?? '—',
    fase?.nombre ?? '—',
    zona?.nombre ?? '—'
  ].join(' · ')

  const contenido = !zona ? (
    <p className='text-muted-foreground py-4'>Cargando zona...</p>
  ) : fechasExistentes.length > 0 ? (
    <FechasZona
      fechas={fechasExistentes}
      equipos={zona.equipos ?? []}
      zonaId={zonaId}
    />
  ) : (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-6'>
        <FixtureSelectorFecha
          primeraFecha={primeraFecha}
          onFechaChange={setPrimeraFecha}
        />
        <FixtureAlgoritmosDisponiblesParaGenerar
          algoritmos={algoritmos}
          cantidadEquipos={cantidadEquipos}
          algoritmoSeleccionado={algoritmoSeleccionado}
          onAlgoritmoSeleccionadoChange={(algo) => {
            setAlgoritmoSeleccionado(algo)
            if ((algo?.fechas?.length ?? 0) === 0) setListaFijada(null)
          }}
          onGenerarFixture={handleGenerarFixture}
        />
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <FixtureGeneracionListaEquipos listaOrdenada={listaOrdenada} />
      </DndContext>

      {listaFijada != null &&
        algoritmoSeleccionado?.fechas != null &&
        algoritmoSeleccionado.fechas.length > 0 && (
          <ResultadoFixture
            fechas={algoritmoSeleccionado.fechas}
            lista={listaFijada}
            zonaId={zonaId}
            primeraFecha={primeraFecha}
          />
        )}
    </div>
  )

  return (
    <FlujoHomeLayout
      titulo='Fixture'
      subtitulo={subtitulo}
      iconoTitulo='Fixture'
      pathBotonVolver={pathVolver}
      contenedorClassName='max-w-6xl'
      contenido={contenido}
      contenidoEnCard={false}
    />
  )
}
