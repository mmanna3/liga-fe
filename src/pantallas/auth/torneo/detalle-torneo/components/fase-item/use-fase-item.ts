import { api } from '@/api/api'
import { TorneoFaseDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { useQueryClient } from '@tanstack/react-query'

interface UseFaseItemParams {
  torneoId: number
  faseOriginal?: TorneoFaseDTO
}

export function useFaseItem({ torneoId, faseOriginal }: UseFaseItemParams) {
  const queryClient = useQueryClient()

  const cambiarNombreMutation = useApiMutation<string>({
    fn: async (nuevoNombre) => {
      if (!faseOriginal?.id) return
      await api.fasesPUT(
        torneoId,
        faseOriginal.id,
        new TorneoFaseDTO({
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
        new TorneoFaseDTO({
          ...faseOriginal,
          faseFormatoId: nuevoFormato === 'todos-contra-todos' ? 1 : 2,
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
