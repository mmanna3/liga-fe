import type { AsignacionHistoricaArbitrosPorAgrupadorDTO } from '@/api/clients'
import { api } from '@/api/api'
import { AsignarArbitrosJornadaDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/design-system/base-ui/tabs'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  construirOpcionesFechasHistoricas,
  construirSlotsInicialesDesdeJornadas,
  idsDesdeSlots,
  obtenerContextoFechaHistorica,
  obtenerJornadaIdsDeFecha,
  obtenerRangoAniosArbitros
} from './asignacion/utilidades-asignacion'
import VistaHistoricaPorArbitro from './historico/vista-historica-por-arbitro'
import VistaHistoricaPorJornada from './historico/vista-historica-por-jornada'

export default function AsignacionHistorica() {
  const anioActual = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState(String(anioActual))
  const [agrupadorSeleccionado, setAgrupadorSeleccionado] = useState('')
  const [torneoSeleccionado, setTorneoSeleccionado] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [modoEdicion, setModoEdicion] = useState(false)
  const [slotsPorJornada, setSlotsPorJornada] = useState<
    Record<number, { arbitro1: string; arbitro2: string }>
  >({})
  const [jornadaGuardandoId, setJornadaGuardandoId] = useState<number | null>(
    null
  )

  const queryClient = useQueryClient()

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

  const torneosHistoricos = historico?.torneos ?? []

  useEffect(() => {
    if (torneosHistoricos.length === 0) {
      setTorneoSeleccionado('')
      setFechaSeleccionada('')
      return
    }
    const sigueValido = torneosHistoricos.some(
      (t) => String(t.id) === torneoSeleccionado
    )
    if (!sigueValido) setTorneoSeleccionado(String(torneosHistoricos[0].id))
  }, [torneosHistoricos, torneoSeleccionado])

  const torneoActivo = useMemo(
    () =>
      torneosHistoricos.find((t) => String(t.id) === torneoSeleccionado) ??
      null,
    [torneosHistoricos, torneoSeleccionado]
  )

  const opcionesFecha = useMemo(
    () => (torneoActivo ? construirOpcionesFechasHistoricas(torneoActivo) : []),
    [torneoActivo]
  )

  useEffect(() => {
    if (opcionesFecha.length === 0) {
      setFechaSeleccionada('')
      return
    }
    const sigueValido = opcionesFecha.some((f) => f.value === fechaSeleccionada)
    if (!sigueValido) setFechaSeleccionada(opcionesFecha[0].value)
  }, [opcionesFecha, fechaSeleccionada])

  const torneoId = Number(torneoSeleccionado) || 0
  const fechaId = Number(fechaSeleccionada) || 0
  const filtrosCompletos =
    agrupadorId > 0 && torneoId > 0 && fechaId > 0 && Boolean(historico)

  const contextoFecha = useMemo(
    () =>
      historico && filtrosCompletos
        ? obtenerContextoFechaHistorica(historico, torneoId, fechaId)
        : null,
    [historico, filtrosCompletos, torneoId, fechaId]
  )

  const jornadaIdsFiltrados = useMemo(
    () =>
      historico && filtrosCompletos
        ? obtenerJornadaIdsDeFecha(historico, torneoId, fechaId)
        : new Set<number>(),
    [historico, filtrosCompletos, torneoId, fechaId]
  )

  useEffect(() => {
    if (contextoFecha) {
      setSlotsPorJornada(
        construirSlotsInicialesDesdeJornadas(contextoFecha.jornadas)
      )
    }
  }, [contextoFecha])

  useEffect(() => {
    setTorneoSeleccionado('')
    setFechaSeleccionada('')
    setModoEdicion(false)
  }, [anioEfectivo, agrupadorSeleccionado])

  const mutationAsignar = useMutation({
    mutationFn: async ({
      jornadaId,
      arbitroIds
    }: {
      jornadaId: number
      arbitroIds: number[]
    }) => {
      await api.asignarArbitrosJornada(
        jornadaId,
        new AsignarArbitrosJornadaDTO({ arbitroIds })
      )
    },
    onMutate: ({ jornadaId }) => setJornadaGuardandoId(jornadaId),
    onSettled: () => setJornadaGuardandoId(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
    onError: () => {
      toast.error('No se pudo guardar la asignación de árbitros')
      if (contextoFecha) {
        setSlotsPorJornada(
          construirSlotsInicialesDesdeJornadas(contextoFecha.jornadas)
        )
      }
    }
  })

  const alCambiarArbitros = (
    jornadaId: number,
    arbitro1: string,
    arbitro2: string
  ) => {
    setSlotsPorJornada((prev) => ({
      ...prev,
      [jornadaId]: { arbitro1, arbitro2 }
    }))
    mutationAsignar.mutate({
      jornadaId,
      arbitroIds: idsDesdeSlots(arbitro1, arbitro2)
    })
  }

  const subtitulo = modoEdicion
    ? 'Corregí las asignaciones de árbitros en fechas pasadas. Los cambios se guardan al seleccionar.'
    : 'Consultá las asignaciones de fechas pasadas y los datos registrados al enviar WhatsApp.'

  const sinDatosHistoricos =
    Boolean(historico) && (historico?.torneos ?? []).length === 0

  return (
    <FlujoHomeLayout
      titulo='Asignaciones históricas'
      subtitulo={subtitulo}
      iconoTitulo='Arbitros'
      pathBotonVolver={rutasNavegacion.arbitros}
      contenedorClassName='max-w-6xl'
      contenido={
        <Tabs defaultValue='por-jornada' className='w-full space-y-6'>
          <div className='space-y-3'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
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
              <ListaDesplegable
                titulo='Torneo'
                id='historico-selector-torneo'
                placeholder={
                  !historico
                    ? 'Cargando torneos…'
                    : torneosHistoricos.length === 0
                      ? 'Sin torneos con fechas pasadas'
                      : 'Seleccioná un torneo'
                }
                opciones={torneosHistoricos.map((t) => ({
                  value: String(t.id),
                  label: t.nombre ?? `Torneo ${t.id}`
                }))}
                valor={torneoSeleccionado}
                alCambiar={setTorneoSeleccionado}
                deshabilitado={!historico || torneosHistoricos.length === 0}
              />
              <ListaDesplegable
                titulo='Fecha'
                id='historico-selector-fecha'
                placeholder={
                  !torneoActivo
                    ? 'Seleccioná un torneo'
                    : opcionesFecha.length === 0
                      ? 'Sin fechas pasadas'
                      : 'Seleccioná una fecha'
                }
                opciones={opcionesFecha.map((f) => ({
                  value: f.value,
                  label: f.label
                }))}
                valor={fechaSeleccionada}
                alCambiar={setFechaSeleccionada}
                deshabilitado={!torneoActivo || opcionesFecha.length === 0}
              />
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <label className='flex cursor-pointer items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded border-border accent-emerald-600'
                  checked={modoEdicion}
                  onChange={(e) => setModoEdicion(e.target.checked)}
                  data-testid='historico-modo-edicion'
                  disabled={!filtrosCompletos}
                />
                Modo edición
              </label>
              <TabsList
                className='grid w-full grid-cols-2 sm:w-auto sm:min-w-[280px]'
                data-testid='historico-tabs'
              >
                <TabsTrigger value='por-jornada'>Por jornada</TabsTrigger>
                <TabsTrigger value='por-arbitro'>Por árbitro</TabsTrigger>
              </TabsList>
            </div>
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
                  <VistaHistoricaPorJornada
                    contexto={contextoFecha}
                    modoEdicion={modoEdicion}
                    arbitrosElegibles={historico.arbitrosElegibles ?? []}
                    slotsPorJornada={slotsPorJornada}
                    jornadaGuardandoId={jornadaGuardandoId}
                    sinDatosHistoricos={sinDatosHistoricos}
                    filtrosCompletos={filtrosCompletos}
                    alCambiarArbitros={alCambiarArbitros}
                  />
                </TabsContent>
                <TabsContent value='por-arbitro' className='mt-0'>
                  <VistaHistoricaPorArbitro
                    arbitros={historico.arbitrosConJornadas ?? []}
                    jornadaIdsFiltrados={jornadaIdsFiltrados}
                    sinDatosHistoricos={sinDatosHistoricos}
                    filtrosCompletos={filtrosCompletos}
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
