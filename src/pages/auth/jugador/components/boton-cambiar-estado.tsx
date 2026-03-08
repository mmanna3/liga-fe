import { CambiarEstadoDelJugadorDTO } from '@/api/clients'
import { Boton } from '@/components/ykn-ui/boton'
import { AccionTipo } from '@/lib/estado-jugador-lib'
import { useCambiarEstadoMutation } from '../hooks/use-cambiar-estado'

interface Props {
  jugador: CambiarEstadoDelJugadorDTO
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
        onClick={() =>
          mutation.mutate([
            new CambiarEstadoDelJugadorDTO({ ...jugador, motivo })
          ])
        }
        estaCargando={mutation.isPending}
      >
        {label}
      </Boton>
    </div>
  )
}

export default BotonCambiarEstado
