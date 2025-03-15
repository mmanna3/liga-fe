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
  motivo: string
}

const BotonCambiarEstado = ({
  jugador,
  label,
  action,
  mensajeExito,
  motivo
}: Props) => {
  const mutation = useCambiarEstadoMutation(action, mensajeExito)

  return (
    <div>
      <Boton
        onClick={() => mutation.mutate({ ...jugador, motivo })}
        estaCargando={mutation.isPending}
      >
        {label}
      </Boton>
    </div>
  )
}

export default BotonCambiarEstado
