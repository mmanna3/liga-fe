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

export default function ArbitrosHub() {
  const navigate = useNavigate()

  return (
    <FlujoHomeLayout
      titulo='Árbitros'
      iconoTitulo='Arbitros'
      ocultarBotonVolver
      contenidoEnCard={false}
      contenido={
        <div className='grid grid-cols-1 gap-4 py-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card
            className='cursor-pointer transition-colors hover:bg-muted/50'
            role='button'
            tabIndex={0}
            onClick={() => navigate(rutasNavegacion.datosArbitros)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
            }}
          >
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icono nombre='Arbitros' className='h-8 w-8' />
                Datos de los árbitros
              </CardTitle>
              <CardDescription>
                Alta, baja y modificación de árbitros y sus agrupadores de
                torneo.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className='cursor-pointer transition-colors hover:bg-muted/50'
            role='button'
            tabIndex={0}
            onClick={() => navigate(rutasNavegacion.asignacionArbitros)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
            }}
          >
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icono nombre='Pelota' className='h-8 w-8' />
                Próxima fecha
              </CardTitle>
              <CardDescription>
                Asigná árbitros a la próxima fecha de cada agrupador o consultá
                la carga de cada árbitro.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className='cursor-pointer transition-colors hover:bg-muted/50'
            role='button'
            tabIndex={0}
            data-testid='hub-asignaciones-historicas'
            onClick={() => navigate(rutasNavegacion.historicoArbitros)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
            }}
          >
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icono nombre='Arbitros' className='h-8 w-8' />
                Asignaciones históricas
              </CardTitle>
              <CardDescription>
                Consultá asignaciones de fechas pasadas y los datos enviados por
                WhatsApp.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    />
  )
}
