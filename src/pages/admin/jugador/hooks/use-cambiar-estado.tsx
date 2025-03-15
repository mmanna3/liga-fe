import { CambiarEstadoDelJugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate } from 'react-router-dom'

export const useCambiarEstadoMutation = (
  action: (dto: CambiarEstadoDelJugadorDTO[]) => Promise<number>,
  mensajeDeExito: string
) => {
  const navigate = useNavigate()

  return useApiMutation({
    fn: async (dto: CambiarEstadoDelJugadorDTO[]) => {
      await action(dto)
    },

    antesDeMensajeExito: () => navigate(`${rutasNavegacion.jugadores}`),
    mensajeDeExito
  })
}
