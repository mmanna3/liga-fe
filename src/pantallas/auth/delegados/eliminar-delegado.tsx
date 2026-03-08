import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function EliminarDelegado() {
  const { id, usuario } = useParams<{ id: string; usuario: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const mutation = useApiMutation({
    fn: async (delegadoId: number) => {
      await api.delegadoDELETE(delegadoId)
    },
    antesDeMensajeExito: () =>
      navigate(`${rutasNavegacion.delegados}${location.search}`),
    mensajeDeExito: `El delegado '${usuario}' fue eliminado.`
  })

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
