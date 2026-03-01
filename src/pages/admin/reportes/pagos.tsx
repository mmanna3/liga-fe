import { api } from '@/api/api'
import { ReportePagosDTO } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

interface FormValues {
  mes: string
  anio: string
}

const meses = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
]

const anios = () => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }))
}

const getNombreMes = (mes: number) => {
  return meses.find((m) => parseInt(m.value) === mes)?.label || ''
}

export default function ReportePagosPage() {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    defaultValues: {
      mes: new Date().getMonth() + 1 + '',
      anio: new Date().getFullYear() + ''
    }
  })

  const { data, isLoading, refetch } = useApiQuery<ReportePagosDTO[]>({
    key: ['reporte-pagos', form.watch('mes'), form.watch('anio')],
    fn: async () => {
      const mesValue = form.watch('mes')
      const anioValue = form.watch('anio')

      const mes =
        mesValue && mesValue !== 'todos' ? parseInt(mesValue) : undefined
      const anio =
        anioValue && anioValue !== 'todos' ? parseInt(anioValue) : undefined

      return await api.obtenerReportePagos(mes, anio)
    }
  })

  const onSubmit = () => {
    refetch()
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Reporte de Pagos</h1>
        <Button variant='outline' onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col md:flex-row gap-4'
            >
              <FormField
                control={form.control}
                name='mes'
                render={({
                  field
                }: {
                  field: { onChange: (value: string) => void; value: string }
                }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Mes</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar mes' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='todos'>Todos</SelectItem>
                        {meses.map((mes) => (
                          <SelectItem key={mes.value} value={mes.value}>
                            {mes.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='anio'
                render={({
                  field
                }: {
                  field: { onChange: (value: string) => void; value: string }
                }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>Año</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar año' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='todos'>Todos</SelectItem>
                        {anios().map((anio) => (
                          <SelectItem key={anio.value} value={anio.value}>
                            {anio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <Button type='submit' className='mt-auto'>
                Filtrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex justify-center p-4'>Cargando...</div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead className='text-right'>
                    Jugadores Pagados
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: ReportePagosDTO, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.nombreEquipo}</TableCell>
                    <TableCell>{getNombreMes(Number(item.mes))}</TableCell>
                    <TableCell>{item.anio}</TableCell>
                    <TableCell className='text-right'>
                      {item.cantidadJugadoresPagados}
                    </TableCell>
                  </TableRow>
                ))}
                {data && data.length > 0 && (
                  <TableRow className='font-bold'>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className='text-right'>
                      {data.reduce(
                        (sum, item) =>
                          sum + (item.cantidadJugadoresPagados ?? 0),
                        0
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className='text-center p-4'>
              No hay datos para mostrar con los filtros seleccionados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
