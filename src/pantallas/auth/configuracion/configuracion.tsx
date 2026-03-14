import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate } from 'react-router-dom'

export default function Configuracion() {
  const navigate = useNavigate()

  return (
    <FlujoHomeLayout
      titulo='Configuración'
      iconoTitulo='Configuracion'
      ocultarBotonVolver
      contenidoEnCard={false}
      contenido={
        <div className='grid grid-cols-2 gap-4 py-6'>
          <Card
            className='cursor-pointer transition-colors hover:bg-muted/50'
            role='button'
            tabIndex={0}
            onClick={() => navigate(rutasNavegacion.generacionDeFixtures)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
            }}
          >
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icono nombre='Fixture' className='h-8 w-8' />
                Generación de fixture
              </CardTitle>
              <CardDescription>
                Gestioná algoritmos de generación de fixture para distintas
                cantidades de equipos.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    />
  )
}
