import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { JugadorParaCambioDeEstadoDTO } from '@/lib/estado-jugador-lib'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate } from 'react-router-dom'

export const useCambiarEstadoMutation = (
  action: (dto: JugadorParaCambioDeEstadoDTO) => Promise<number>,
  mensajeDeExito: string
) => {
  const navigate = useNavigate()

  return useApiMutation({
    fn: async (dto: JugadorParaCambioDeEstadoDTO) => {
      await action(dto)
    },

    antesDeMensajeExito: () => navigate(`${rutasNavegacion.jugadores}`),
    mensajeDeExito
  })
}
