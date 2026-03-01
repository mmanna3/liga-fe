import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { rutasNavegacion } from '@/routes/rutas'
import { BarChart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ReportesPage() {
  const navigate = useNavigate()

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Reportes</h1>
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='overflow-hidden'>
          <CardHeader className='bg-slate-50'>
            <CardTitle className='flex items-center gap-2'>
              <BarChart className='h-5 w-5' />
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
