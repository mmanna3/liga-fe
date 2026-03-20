import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import TablaJugador from './components/tabla'

export default function Jugador() {
  return (
    <FlujoHomeLayout
      titulo='Jugadores'
      iconoTitulo='Jugadores'
      ocultarBotonVolver
      contenedorClassName='max-w-6xl'
      contenido={<TablaJugador />}
    />
  )
}
