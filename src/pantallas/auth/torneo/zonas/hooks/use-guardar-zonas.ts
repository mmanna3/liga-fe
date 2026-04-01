import { api } from '@/api/api'
import { ZonaDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validarZonasParaGuardar, zonaEstadoADto } from '../tipos'
import type { ZonaEstado } from '../tipos'

interface UseGuardarZonasParams {
  zonasEstado: ZonaEstado[]
  modo: 'crear' | 'modificar'
  refetch: () => Promise<unknown>
}

export function useGuardarZonas({
  zonasEstado,
  modo,
  refetch
}: UseGuardarZonasParams) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: torneoIdParam, faseId: faseIdParam } = useParams<{
    id: string
    faseId: string
  }>()

  const torneoId = Number(torneoIdParam)
  const faseId = Number(faseIdParam)
  const navegarHacia = useRef<string | null>(null)

  const guardarMutation = useApiMutation<ZonaDTO[]>({
    fn: async (body) => {
      if (modo === 'crear') {
        return await api.crearZonasMasivamente(faseId, body)
      } else {
        await api.modificarZonasMasivamente(faseId, body)
      }
    },
    mensajeDeExito:
      modo === 'crear'
        ? 'Zonas creadas correctamente'
        : 'Zonas actualizadas correctamente',
    antesDeMensajeExito: () => {
      if (modo === 'crear') {
        queryClient.invalidateQueries({ queryKey: ['zonasAll', faseId] })
      } else {
        refetch()
      }
      const destino = navegarHacia.current
      if (destino != null) {
        navigate(destino)
      }
    }
  })

  const guardar = useCallback(
    (destino?: string) => {
      const validacion = validarZonasParaGuardar(zonasEstado)
      if (!validacion.valido) {
        toast.error(validacion.mensaje)
        return
      }
      navegarHacia.current = destino ?? null
      const body = zonasEstado.map((z) => zonaEstadoADto(z, faseId))
      guardarMutation.mutate(body)
    },
    [zonasEstado, faseId, guardarMutation]
  )

  const handleGuardar = useCallback(() => guardar(), [guardar])

  const handleIrAFixture = useCallback(
    (zonaId: number) => {
      const path = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas/${zonaId}/fixture`
      guardar(path)
    },
    [guardar, torneoId, faseId]
  )

  return {
    guardarMutation,
    handleGuardar,
    handleIrAFixture
  }
}
