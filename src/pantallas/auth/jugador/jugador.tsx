import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import TablaJugador from './components/tabla'

export default function Jugador() {
  return (
    <FlujoHomeLayout
      titulo='Jugadores'
      iconoTitulo={
        <Icono nombre='Jugadores' className='h-8 w-8 text-primary' />
      }
      ocultarBotonVolver
      contenido={<TablaJugador />}
    />
  )
}
