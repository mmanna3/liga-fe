import { api } from '@/api/api'
import type { FixtureAlgoritmoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Button } from '@/design-system/base-ui/button'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { DndContext } from '@dnd-kit/core'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FechasZona } from './fechas-zona'
import { FilaLista, SlotDroppable } from './fila-lista'
import { EspecialDraggable, ZonaDerechaDroppable } from './panel-especiales'
import { ResultadoFixture } from './resultado-fixture'
import type { ItemFixture } from './types'
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

  const algoritmoSeleccionado = useMemo(
    () =>
      algoritmos.find(
        (a: FixtureAlgoritmoDTO) => a.cantidadDeEquipos === cantidadEquipos
      ),
    [algoritmos, cantidadEquipos]
  )

  const tieneAlgoritmoConfigurado =
    (algoritmoSeleccionado?.fechas?.length ?? 0) > 0

  const [listaFijada, setListaFijada] = useState<ItemFixture[] | null>(null)

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
    <FechasZona fechas={fechasExistentes} equipos={zona.equipos ?? []} />
  ) : (
    <>
      {listaFijada == null && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <p className='text-sm text-muted-foreground mb-4'>
            Algoritmos de fixture disponibles:{' '}
            {algoritmos.map((a: FixtureAlgoritmoDTO) => (
              <span key={a.id ?? a.cantidadDeEquipos}>
                <span
                  className={
                    a.cantidadDeEquipos === cantidadEquipos
                      ? 'py-1 px-2 rounded-md mx-1 bg-primary text-primary-foreground'
                      : 'py-1 px-2 rounded-md bg-muted-foreground/10 mx-1 text-muted-foreground'
                  }
                >
                  {a.cantidadDeEquipos}
                </span>
              </span>
            ))}
          </p>
          <div className='flex items-center gap-4 mb-2'>
            <Button
              disabled={!tieneAlgoritmoConfigurado}
              onClick={handleGenerarFixture}
            >
              Generar fixture
            </Button>
            {algoritmoSeleccionado != null && !tieneAlgoritmoConfigurado && (
              <p className='text-sm text-muted-foreground'>
                El fixture para esta cantidad de equipos no está configurado.
                Configuralo desde el menú{' '}
                <span className='inline-flex items-center gap-1'>
                  <Icono nombre='Configuracion' className='size-4' />
                  Configuración
                </span>
                .
              </p>
            )}
          </div>
          <div className='flex gap-8 py-6'>
            <div className='flex-1 min-w-0'>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Orden de equipos (arrastrá para reordenar)
              </h3>
              <ul className='space-y-2 list-none p-0 m-0'>
                {listaOrdenada.map((item, index) => (
                  <SlotDroppable key={`slot-${index}`} index={index}>
                    <FilaLista item={item} index={index} />
                  </SlotDroppable>
                ))}
                <SlotDroppable index={listaOrdenada.length}>
                  <div className='rounded-md border-2 border-dashed border-muted-foreground/25 px-3 py-2 min-h-[44px]' />
                </SlotDroppable>
              </ul>
            </div>

            <div className='w-48 shrink-0'>
              <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                Agregar a la lista
              </h3>
              <ZonaDerechaDroppable>
                <div className='space-y-2'>
                  <EspecialDraggable valor='INTERZONAL' />
                  <EspecialDraggable valor='LIBRE' />
                </div>
                <p className='text-xs text-muted-foreground pt-2'>
                  Arrastrá Libre o Interzonal a la lista para sumarlos. Arrastrá
                  desde la lista acá para quitarlos.
                </p>
              </ZonaDerechaDroppable>
            </div>
          </div>
        </DndContext>
      )}

      {listaFijada != null && (
        <ResultadoFixture
          fechas={algoritmoSeleccionado!.fechas!}
          lista={listaFijada}
          zonaId={zonaId}
        />
      )}
    </>
  )

  return (
    <FlujoHomeLayout
      titulo='Fixture'
      subtitulo={subtitulo}
      iconoTitulo='Fixture'
      pathBotonVolver={pathVolver}
      contenedorClassName='max-w-6xl'
      contenido={contenido}
    />
  )
}
