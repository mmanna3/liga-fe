import { CambiarVisibilidadEnAppDTO } from '@/api/clients'
import { api } from '@/api/api'
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
      await api.torneoCambiarVisibilidadEnApp(
        torneoId,
        new CambiarVisibilidadEnAppDTO({ esVisibleEnApp: !actual })
      )
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
      await api.fasesCambiarVisibilidadEnApp(
        torneoId,
        faseId,
        new CambiarVisibilidadEnAppDTO({ esVisibleEnApp: !actual })
      )
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: MENSAJE
  })
}
