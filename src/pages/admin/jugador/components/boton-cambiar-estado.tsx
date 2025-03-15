import { Boton } from '@/components/ykn-ui/boton'
import {
  AccionTipo,
  JugadorParaCambioDeEstadoDTO
} from '@/lib/estado-jugador-lib'
import { useCambiarEstadoMutation } from '../hooks/use-cambiar-estado'

interface Props {
  jugador: JugadorParaCambioDeEstadoDTO
  label: string
  action: AccionTipo
  mensajeExito: string
}

const BotonCambiarEstado = ({
  jugador,
  label,
  action,
  mensajeExito
}: Props) => {
  const mutation = useCambiarEstadoMutation(action, mensajeExito)

  return (
    <div>
      <Boton
        onClick={() => mutation.mutate(jugador)}
        estaCargando={mutation.isPending}
      >
        {label}
      </Boton>
    </div>
  )
}

export default BotonCambiarEstado
