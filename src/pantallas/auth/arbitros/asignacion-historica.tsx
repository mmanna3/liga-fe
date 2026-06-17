import type { AsignacionHistoricaArbitrosPorAgrupadorDTO } from '@/api/clients'
import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/design-system/base-ui/tabs'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMemo, useState, useEffect } from 'react'
import { obtenerRangoAniosArbitros } from './asignacion/utilidades-asignacion'
import VistaHistoricaPorArbitro from './historico/vista-historica-por-arbitro'
import VistaHistoricaPorJornada from './historico/vista-historica-por-jornada'

export default function AsignacionHistorica() {
  const anioActual = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState(String(anioActual))
  const [agrupadorSeleccionado, setAgrupadorSeleccionado] = useState('')

  const aniosDisponibles = useMemo(
    () => obtenerRangoAniosArbitros(anioActual),
    [anioActual]
  )
  const anioEfectivo = aniosDisponibles.includes(Number(anioSeleccionado))
    ? Number(anioSeleccionado)
    : anioActual

  const { data: torneos = [] } = useApiQuery({
    key: ['torneos', 'filtrar', anioEfectivo],
    fn: async () => await api.torneosFiltrar(anioEfectivo, undefined)
  })

  const agrupadoresConTorneos = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const torneo of torneos) {
      const id = String(torneo.torneoAgrupadorId ?? '')
      const nombre = torneo.torneoAgrupadorNombre?.trim() || 'Sin nombre'
      if (id && !mapa.has(id)) mapa.set(id, nombre)
    }
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [torneos])

  useEffect(() => {
    if (agrupadoresConTorneos.length === 0) {
      setAgrupadorSeleccionado('')
      return
    }
    const sigueValido = agrupadoresConTorneos.some(
      (a) => a.id === agrupadorSeleccionado
    )
    if (!sigueValido) setAgrupadorSeleccionado(agrupadoresConTorneos[0].id)
  }, [agrupadoresConTorneos, agrupadorSeleccionado])

  const agrupadorId = Number(agrupadorSeleccionado) || 0
  const queryKey = ['arbitro-asignacion-historica', agrupadorId, anioEfectivo]

  const {
    data: historico,
    isLoading,
    isError
  } = useApiQuery<AsignacionHistoricaArbitrosPorAgrupadorDTO>({
    key: queryKey,
    fn: async () =>
      await api.arbitroAsignacionHistoricaPorAgrupador(
        agrupadorId,
        anioEfectivo
      ),
    activado: agrupadorId > 0
  })

  return (
    <FlujoHomeLayout
      titulo='Asignaciones históricas'
      subtitulo='Consultá las asignaciones de fechas pasadas y los datos registrados al enviar WhatsApp.'
      iconoTitulo='Arbitros'
      pathBotonVolver={rutasNavegacion.arbitros}
      contenedorClassName='max-w-6xl'
      contenido={
        <Tabs defaultValue='por-jornada' className='w-full space-y-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex min-w-0 flex-1 flex-col gap-3 sm:max-w-2xl sm:flex-row'>
              <div className='min-w-[140px] flex-1'>
                <ListaDesplegable
                  titulo='Año'
                  id='historico-selector-anio'
                  opciones={aniosDisponibles.map((anio) => ({
                    value: String(anio),
                    label: String(anio)
                  }))}
                  valor={String(anioEfectivo)}
                  alCambiar={setAnioSeleccionado}
                />
              </div>
              <div className='min-w-[200px] flex-[2]'>
                <ListaDesplegable
                  titulo='Agrupador'
                  id='historico-selector-agrupador'
                  placeholder={
                    agrupadoresConTorneos.length === 0
                      ? 'Sin agrupadores con torneos este año'
                      : 'Seleccioná un agrupador'
                  }
                  opciones={agrupadoresConTorneos.map((a) => ({
                    value: a.id,
                    label: a.nombre
                  }))}
                  valor={agrupadorSeleccionado}
                  alCambiar={setAgrupadorSeleccionado}
                  deshabilitado={agrupadoresConTorneos.length === 0}
                />
              </div>
            </div>
            <TabsList
              className='grid w-full grid-cols-2 sm:w-auto sm:min-w-[280px]'
              data-testid='historico-tabs'
            >
              <TabsTrigger value='por-jornada'>Por jornada</TabsTrigger>
              <TabsTrigger value='por-arbitro'>Por árbitro</TabsTrigger>
            </TabsList>
          </div>

          <ContenedorCargandoYError
            estaCargando={isLoading && agrupadorId > 0}
            hayError={isError}
          >
            {!agrupadorSeleccionado ? (
              <p className='py-8 text-center text-muted-foreground'>
                Seleccioná un agrupador con torneos en el año elegido.
              </p>
            ) : historico ? (
              <>
                <TabsContent value='por-jornada' className='mt-0'>
                  <VistaHistoricaPorJornada data={historico} />
                </TabsContent>
                <TabsContent value='por-arbitro' className='mt-0'>
                  <VistaHistoricaPorArbitro
                    arbitros={historico.arbitrosConJornadas ?? []}
                  />
                </TabsContent>
              </>
            ) : null}
          </ContenedorCargandoYError>
        </Tabs>
      }
    />
  )
}
