import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { useParams } from 'react-router-dom'

export function useAmarillasTorneo() {
  const { id } = useParams<{ id: string }>()
  const torneoId = Number(id)
  const esAdmin = useAuth((state) => state.esAdmin)

  const {
    data: torneo,
    isLoading: torneoCargando,
    isError: torneoError
  } = useApiQuery({
    key: ['torneo', id],
    fn: async () => await api.torneoGET(torneoId)
  })

  const permiteLimpiar = !!torneo?.permiteLimpiarAmarillas
  const habilitado = !!torneo && permiteLimpiar && esAdmin()

  const {
    data: jugadores,
    isLoading: jugadoresCargando,
    isError: jugadoresError,
    refetch
  } = useApiQuery({
    key: ['torneo', id, 'jugadores-con-amarillas'],
    fn: async () => await api.torneoJugadoresConAmarillas(torneoId),
    activado: habilitado
  })

  const limpiarMutation = useApiMutation<void>({
    fn: async () => {
      await api.torneoLimpiarAmarillas(torneoId)
    },
    antesDeMensajeExito: () => {
      void refetch()
    },
    mensajeDeExito: 'Se pusieron en cero las tarjetas amarillas del torneo'
  })

  return {
    torneoId,
    torneo,
    esAdmin: esAdmin(),
    permiteLimpiar,
    habilitado,
    cargando: torneoCargando || (habilitado && jugadoresCargando),
    hayError: torneoError || jugadoresError,
    jugadores: jugadores ?? [],
    limpiarMutation
  }
}
