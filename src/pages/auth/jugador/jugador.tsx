import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import Icono from '@/components/ykn-ui/icono'
import TablaJugador from './tabla'

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
