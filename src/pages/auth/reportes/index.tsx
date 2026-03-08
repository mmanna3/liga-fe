import { Button } from '@/ui/base-ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/ui/base-ui/card'
import { rutasNavegacion } from '@/routes/rutas'
import Icono from '@/ui/ykn-ui/icono'

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
          <CardHeader className='bg-slate-50'>
            <CardTitle className='flex items-center gap-2'>
              <Icono nombre='Reportes' className='h-5 w-5' />
              Reporte de Pagos
            </CardTitle>
            <CardDescription>
              Ver la cantidad de jugadores pagados por equipo y mes
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            <Button
              onClick={() => navigate(rutasNavegacion.reportePagos)}
              className='w-full'
            >
              Ver Reporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
