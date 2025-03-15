import { CambiarEstadoDelJugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { useNavigate } from 'react-router-dom'

export const useCambiarEstadoMutation = (
  action: (dto: CambiarEstadoDelJugadorDTO[]) => Promise<number>,
  mensajeDeExito: string
) => {
  const navigate = useNavigate()

  return useApiMutation({
    fn: async (dto: CambiarEstadoDelJugadorDTO[]) => {
      const resultado = await action(dto)
      if (resultado <= 0) {
        throw new Error('No se pudo realizar el cambio de estado')
      }
      return resultado
    },
    antesDeMensajeExito: () => navigate(-1),
    mensajeDeExito
  })
}
