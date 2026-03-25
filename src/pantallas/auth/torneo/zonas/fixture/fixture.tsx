import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FechasZona } from './fechas/fechas'
import { PanelEliminacionDirecta } from './generacion/panel-eliminacion-directa'
import { PanelTodosContraTodos } from './generacion/panel-todos-contra-todos'
import { useListaFixture } from './hooks/use-lista-fixture'
import { toDateOnly } from '@/logica-compartida/utils'

const FASE_FORMATO_ELIMINACION_DIRECTA = 2

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

  const [primeraFecha, setPrimeraFecha] = useState<Date>(() =>
    toDateOnly(new Date())
  )

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
  ) : fase?.faseFormatoId === FASE_FORMATO_ELIMINACION_DIRECTA ? (
    <PanelEliminacionDirecta
      listaOrdenada={listaOrdenada}
      sensors={sensors}
      handleDragEnd={handleDragEnd as never}
      primeraFecha={primeraFecha}
      onPrimeraFechaChange={setPrimeraFecha}
    />
  ) : (
    <PanelTodosContraTodos
      algoritmos={algoritmos}
      listaOrdenada={listaOrdenada}
      sensors={sensors}
      handleDragEnd={handleDragEnd as never}
      zonaId={zonaId}
      primeraFecha={primeraFecha}
      onPrimeraFechaChange={setPrimeraFecha}
    />
  )

  return (
    <FlujoHomeLayout
      titulo='Fixture'
      subtitulo={subtitulo}
      iconoTitulo='Fixture'
      contenedorClassName='max-w-6xl'
      contenido={contenido}
      contenidoEnCard={false}
    />
  )
}
