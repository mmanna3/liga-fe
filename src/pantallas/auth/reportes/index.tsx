import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'

import { useNavigate } from 'react-router-dom'

export default function ReportesPage() {
  const navigate = useNavigate()

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold flex items-center gap-3'>
        <Icono nombre='Reportes' className='h-8 w-8 text-primary' />
        Reportes
      </h1>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icono nombre='Reportes' className='h-5 w-5' />
              Reporte de Pagos
            </CardTitle>
            <CardDescription>
              Ver la cantidad de jugadores pagados por equipo y mes
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <Boton
              onClick={() => navigate(rutasNavegacion.reportePagos)}
              className='w-full'
            >
              Ver Reporte
            </Boton>
          </CardContent>
        </Card>
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icono nombre='Reportes' className='h-5 w-5' />
              Fichajes pagados por torneo
            </CardTitle>
            <CardDescription>
              Muestra cuántos fichajes se pagaron en el año seleccionado,
              desglosados por agrupador, torneo y mes de pago. Solo incluye
              jugadores cuyo equipo está inscripto en una zona de un torneo de
              ese año. No refleja el estado actual del jugador (activo,
              suspendido, etc.), sino la fecha en que se registró el pago.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <Boton
              onClick={() =>
                navigate(rutasNavegacion.reporteFichajesPagadosPorTorneo)
              }
              className='w-full'
            >
              Ver Reporte
            </Boton>
          </CardContent>
        </Card>
        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Icono nombre='Reportes' className='h-5 w-5' />
              Jugadores activos por torneo
            </CardTitle>
            <CardDescription>
              Muestra cuántos jugadores están en estado Activo en este momento,
              desglosados por agrupador y torneo del año seleccionado. Solo
              incluye jugadores cuyo equipo está inscripto en una zona de un
              torneo de ese año. Opcionalmente se puede ver la cantidad por cada
              equipo.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <Boton
              onClick={() =>
                navigate(rutasNavegacion.reporteJugadoresActivosPorTorneo)
              }
              className='w-full'
            >
              Ver Reporte
            </Boton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
