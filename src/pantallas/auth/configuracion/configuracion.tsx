import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'

export default function Configuracion() {
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
            onClick={() => {}}
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
