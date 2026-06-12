import { api } from '@/api/api'
import { FaseCategoriaDTO, FaseDTO, TipoDeFaseEnum } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { useQueryClient } from '@tanstack/react-query'
import type { Categoria } from '../../../crear-torneo/tipos'
import { faseCategoriasACategoriaDto } from '../../lib'

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

  const guardarCategoriasMutation = useApiMutation<Categoria[]>({
    fn: async (categorias) => {
      if (!faseOriginal?.id) return
      const categoriasDto = faseCategoriasACategoriaDto(
        categorias,
        faseOriginal.id
      ).map((c) => new FaseCategoriaDTO({ ...c }))
      await api.fasesPUT(
        torneoId,
        faseOriginal.id,
        new FaseDTO({
          ...faseOriginal,
          torneoId,
          categorias: categoriasDto
        })
      )
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: 'Categorías actualizadas'
  })

  return {
    cambiarNombreMutation,
    cambiarFormatoMutation,
    guardarCategoriasMutation
  }
}
