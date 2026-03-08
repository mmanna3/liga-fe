import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import TablaJugador from './tabla'

export default function Jugador() {
  return (
    <FlujoHomeLayout
      titulo='Jugadores'
      ocultarBotonVolver
      contenido={<TablaJugador />}
    />
  )
}
