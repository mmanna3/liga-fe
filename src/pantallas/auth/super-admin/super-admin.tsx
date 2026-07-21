import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import CardBuscarLogs from './components/card-buscar-logs'
import CardRestaurarBd from './components/card-restaurar-bd'
import CardRestaurarImagenes from './components/card-restaurar-imagenes'

export default function SuperAdmin() {
  return (
    <FlujoHomeLayout
      titulo='SuperAdmin'
      iconoTitulo='SuperAdmin'
      ocultarBotonVolver
      contenidoEnCard={false}
      contenido={
        <div className='flex flex-col gap-4 py-6'>
          <div className='grid grid-cols-2 gap-4'>
            <CardRestaurarBd />
            <CardRestaurarImagenes />
          </div>
          <CardBuscarLogs />
        </div>
      }
    />
  )
}
