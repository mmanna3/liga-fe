import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function EliminarDelegado() {
  const { id, usuario } = useParams<{ id: string; usuario: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const esAdmin = useAuth((state) => state.esAdmin)

  const mutation = useApiMutation({
    fn: async (delegadoId: number) => {
      await api.delegadoDELETE(delegadoId)
    },
    antesDeMensajeExito: () =>
      navigate(`${rutasNavegacion.delegados}${location.search}`),
    mensajeDeExito: `El delegado '${usuario}' fue eliminado.`
  })

  useEffect(() => {
    if (!esAdmin()) {
      navigate(rutasNavegacion.delegados, { replace: true })
    }
  }, [esAdmin, navigate])

  if (!esAdmin()) {
    return null
  }

  return (
    <ModalEliminacion
      titulo='Eliminar delegado'
      subtitulo='Al eliminar el delegado, se lo desvinculará del club al que pertenezca.'
      eliminarOnClick={() => mutation.mutate(Number(id))}
      eliminarTexto='Eliminar delegado'
      standalone
      onCancelar={() => navigate(-1)}
      estaCargando={mutation.isPending}
    />
  )
}
