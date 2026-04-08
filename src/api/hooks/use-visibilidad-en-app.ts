import {
  fechaCambiarVisibilidadEnApp,
  faseCambiarVisibilidadEnApp,
  torneoCambiarVisibilidadEnApp
} from '@/api/visibilidad-en-app-api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { useQueryClient } from '@tanstack/react-query'

const MENSAJE = 'Visibilidad en la app actualizada'

/** Toggle de visibilidad en app del torneo (PUT dedicado; invalidación vía `refetch`). */
export function useToggleVisibilidadTorneoEnApp(
  torneoId: number,
  esVisibleEnApp: boolean | undefined,
  refetch: () => void
) {
  return useApiMutation<void>({
    fn: async () => {
      const actual = esVisibleEnApp ?? true
      await torneoCambiarVisibilidadEnApp(torneoId, !actual)
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: MENSAJE
  })
}

/** Toggle de visibilidad en app de una fase (PUT dedicado; invalida queries del torneo). */
export function useToggleVisibilidadFaseEnApp(
  torneoId: number,
  faseId: number | undefined,
  esVisibleEnApp: boolean | undefined
) {
  const queryClient = useQueryClient()

  return useApiMutation<void>({
    fn: async () => {
      if (faseId === undefined) return
      const actual = esVisibleEnApp ?? true
      await faseCambiarVisibilidadEnApp(torneoId, faseId, !actual)
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: MENSAJE
  })
}

/** Toggle de visibilidad en app de una fecha (PUT dedicado; invalida el listado de fechas de la zona). */
export function useToggleVisibilidadFechaEnApp(
  zonaId: number,
  fechaId: number | undefined,
  esVisibleEnApp: boolean | undefined
) {
  const queryClient = useQueryClient()

  return useApiMutation<void>({
    fn: async () => {
      if (fechaId === undefined) return
      const actual = esVisibleEnApp ?? true
      await fechaCambiarVisibilidadEnApp(zonaId, fechaId, !actual)
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      queryClient.invalidateQueries({
        queryKey: ['fechasEliminacionDirecta', zonaId]
      })
    },
    mensajeDeExito: MENSAJE
  })
}
