import { api } from '@/api/api'
import { ReportePagosDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/design-system/base-ui/table'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const [mes, setMes] = useState<string>(new Date().getMonth() + 1 + '')
  const [anio, setAnio] = useState<string>(new Date().getFullYear() + '')

  const { data, isLoading, refetch } = useApiQuery<ReportePagosDTO[]>({
    key: ['reporte-pagos', mes, anio],
    fn: async () => {
      const mesNum = mes && mes !== 'todos' ? parseInt(mes) : undefined
      const anioNum = anio && anio !== 'todos' ? parseInt(anio) : undefined
      return await api.obtenerReportePagos(mesNum, anioNum)
    }
  })

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Reporte de Pagos</h1>
        <Boton variant='outline' onClick={() => navigate(-1)}>
          Volver
        </Boton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              refetch()
            }}
            className='flex flex-col md:flex-row gap-4'
          >
            <ListaDesplegable
              titulo='Mes'
              opciones={[{ value: 'todos', label: 'Todos' }, ...meses]}
              valor={mes}
              alCambiar={setMes}
              placeholder='Seleccionar mes'
              className='flex-1'
            />
            <ListaDesplegable
              titulo='Año'
              opciones={[{ value: 'todos', label: 'Todos' }, ...anios()]}
              valor={anio}
              alCambiar={setAnio}
              placeholder='Seleccionar año'
              className='flex-1'
            />
            <Boton type='submit' className='mt-auto'>
              Filtrar
            </Boton>
          </form>
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
            <MensajeListaVacia mensaje='No hay datos para mostrar con los filtros seleccionados' />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
