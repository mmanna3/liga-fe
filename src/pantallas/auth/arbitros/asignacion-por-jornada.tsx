import { api } from '@/api/api'
import type { AsignacionArbitrosPorAgrupadorDTO } from '@/api/clients'
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
import VistaPorArbitro from './asignacion/vista-por-arbitro'
import VistaPorJornada from './asignacion/vista-por-jornada'

function construirSlotsIniciales(data: AsignacionArbitrosPorAgrupadorDTO) {
  const slots: Record<number, { arbitro1: string; arbitro2: string }> = {}
  for (const torneo of data.torneos ?? []) {
    for (const fase of torneo.fases ?? []) {
      for (const zona of fase.zonas ?? []) {
        for (const jornada of zona.proximaFecha?.jornadas ?? []) {
          const asignados = [...(jornada.arbitrosAsignados ?? [])].sort(
            (a, b) => a.orden - b.orden
          )
          slots[jornada.id] = {
            arbitro1: asignados[0] ? String(asignados[0].id) : 'sin-arbitro',
            arbitro2: asignados[1] ? String(asignados[1].id) : 'sin-arbitro'
          }
        }
      }
    }
  }
  return slots
}

function idsDesdeSlots(arbitro1: string, arbitro2: string): number[] {
  const ids: number[] = []
  if (arbitro1 !== 'sin-arbitro') ids.push(Number(arbitro1))
  if (arbitro2 !== 'sin-arbitro' && arbitro2 !== arbitro1)
    ids.push(Number(arbitro2))
  return ids
}

export default function AsignacionPorJornada() {
  const anio = new Date().getFullYear()
  const [agrupadorSeleccionado, setAgrupadorSeleccionado] = useState('')
  const [slotsPorJornada, setSlotsPorJornada] = useState<
    Record<number, { arbitro1: string; arbitro2: string }>
  >({})
  const [jornadaGuardandoId, setJornadaGuardandoId] = useState<number | null>(
    null
  )

  const queryClient = useQueryClient()
  const agrupadorId = Number(agrupadorSeleccionado)

  const { data: torneosAnio } = useApiQuery({
    key: ['torneos', 'filtrar', anio],
    fn: async () => await api.torneosFiltrar(anio, undefined)
  })

  const agrupadoresConTorneos = useMemo(() => {
    const mapa = new Map<number, string>()
    for (const t of torneosAnio ?? []) {
      if (t.torneoAgrupadorId != null && t.torneoAgrupadorNombre) {
        mapa.set(t.torneoAgrupadorId, t.torneoAgrupadorNombre)
      }
    }
    return Array.from(mapa.entries())
      .map(([id, nombre]) => ({ id: String(id), nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [torneosAnio])

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

  const queryKey = ['arbitro-asignacion', agrupadorId, anio]

  const {
    data: asignacion,
    isLoading,
    isError
  } = useApiQuery({
    key: queryKey,
    fn: async () => await api.arbitroAsignacionPorAgrupador(agrupadorId, anio),
    activado: agrupadorId > 0
  })

  useEffect(() => {
    if (asignacion) setSlotsPorJornada(construirSlotsIniciales(asignacion))
  }, [asignacion])

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
      if (asignacion) setSlotsPorJornada(construirSlotsIniciales(asignacion))
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

  return (
    <FlujoHomeLayout
      titulo='Próxima fecha'
      iconoTitulo='Pelota'
      pathBotonVolver={rutasNavegacion.arbitros}
      contenedorClassName='max-w-6xl'
      contenido={
        <Tabs defaultValue='por-jornada' className='w-full space-y-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
            <div className='min-w-[200px] flex-1 max-w-md'>
              <ListaDesplegable
                titulo='Agrupador'
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
            <TabsList className='grid w-full grid-cols-2 sm:w-auto sm:min-w-[280px]'>
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
                Seleccioná un agrupador con torneos este año.
              </p>
            ) : asignacion ? (
              <>
                <TabsContent value='por-jornada' className='mt-0'>
                  <VistaPorJornada
                    data={asignacion}
                    slotsPorJornada={slotsPorJornada}
                    jornadaGuardandoId={jornadaGuardandoId}
                    alCambiarArbitros={alCambiarArbitros}
                  />
                </TabsContent>
                <TabsContent value='por-arbitro' className='mt-0'>
                  <VistaPorArbitro
                    arbitros={asignacion.arbitrosConJornadas ?? []}
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
