import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { Users } from 'lucide-react'
import TablaJugador from './tabla'

export default function Jugador() {
  return (
    <FlujoHomeLayout
      titulo='Jugadores'
      iconoTitulo={<Users className='h-8 w-8 text-primary' />}
      ocultarBotonVolver
      contenido={<TablaJugador />}
    />
  )
}
