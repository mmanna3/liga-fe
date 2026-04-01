import { api } from '@/api/api'
import { FaseDTO, TipoDeFaseEnum } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { useQueryClient } from '@tanstack/react-query'

interface UseFaseItemParams {
  torneoId: number
  faseOriginal?: FaseDTO
}

export function useFaseItem({ torneoId, faseOriginal }: UseFaseItemParams) {
  const queryClient = useQueryClient()

  const cambiarNombreMutation = useApiMutation<string>({
    fn: async (nuevoNombre) => {
      if (!faseOriginal?.id) return
      await api.fasesPUT(
        torneoId,
        faseOriginal.id,
        new FaseDTO({
          ...faseOriginal,
          nombre: nuevoNombre,
          torneoId
        })
      )
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: 'Nombre actualizado'
  })

  const cambiarFormatoMutation = useApiMutation<string>({
    fn: async (nuevoFormato) => {
      if (!faseOriginal?.id) return
      await api.fasesPUT(
        torneoId,
        faseOriginal.id,
        new FaseDTO({
          ...faseOriginal,
          tipoDeFase:
            nuevoFormato === 'todos-contra-todos'
              ? TipoDeFaseEnum._1
              : TipoDeFaseEnum._2,
          torneoId
        })
      )
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: 'Formato actualizado'
  })

  return {
    cambiarNombreMutation,
    cambiarFormatoMutation
  }
}
