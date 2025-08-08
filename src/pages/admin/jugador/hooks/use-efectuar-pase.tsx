import { EfectuarPaseDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { useNavigate } from 'react-router-dom'

export const useEfectuarPaseMutation = (
  action: (dto: EfectuarPaseDTO[]) => Promise<number>,
  mensajeDeExito: string
) => {
  const navigate = useNavigate()

  return useApiMutation({
    fn: async (dto: EfectuarPaseDTO[]) => {
      const resultado = await action(dto)
      if (resultado <= 0) {
        throw new Error('No se pudo realizar el pase')
      }
      return resultado
    },
    antesDeMensajeExito: () => navigate(-1),
    mensajeDeExito
  })
}
