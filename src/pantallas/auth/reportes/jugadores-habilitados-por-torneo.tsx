import { api } from '@/api/api'
import {
  ReporteJugadoresHabilitadosFilaDTO,
  ReporteJugadoresHabilitadosPorAgrupadorDeTorneoDTO
} from '@/api/clients'
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
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const columnasMeses = [
  { key: 'enero', label: 'Enero' },
  { key: 'febrero', label: 'Febrero' },
  { key: 'marzo', label: 'Marzo' },
  { key: 'abril', label: 'Abril' },
  { key: 'mayo', label: 'Mayo' },
  { key: 'junio', label: 'Junio' },
  { key: 'julio', label: 'Julio' },
  { key: 'agosto', label: 'Agosto' },
  { key: 'septiembre', label: 'Septiembre' },
  { key: 'octubre', label: 'Octubre' },
  { key: 'noviembre', label: 'Noviembre' },
  { key: 'diciembre', label: 'Diciembre' }
] as const

type ClaveMes = (typeof columnasMeses)[number]['key']

const anios = () => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }))
}

const obtenerValorMes = (
  item: ReporteJugadoresHabilitadosFilaDTO,
  mes: ClaveMes
) => item[mes] ?? 0

const sumarMeses = (filas: ReporteJugadoresHabilitadosFilaDTO[]) =>
  columnasMeses.reduce(
    (acc, { key }) => {
      acc[key] = filas.reduce(
        (sum, fila) => sum + obtenerValorMes(fila, key),
        0
      )
      return acc
    },
    {} as Record<ClaveMes, number>
  )

export default function ReporteJugadoresHabilitadosPorTorneoPage() {
  const navigate = useNavigate()
  const [anio, setAnio] = useState<string>(new Date().getFullYear() + '')

  const { data, isLoading, refetch } = useApiQuery<
    ReporteJugadoresHabilitadosPorAgrupadorDeTorneoDTO[]
  >({
    key: ['reporte-jugadores-habilitados-por-torneo', anio],
    fn: async () => {
      return await api.obtenerReporteJugadoresHabilitadosPorTorneo(
        parseInt(anio)
      )
    }
  })

  const todasLasFilas =
    data?.flatMap((agrupador) => agrupador.torneos ?? []) ?? []

  const totalesPorMes = sumarMeses(todasLasFilas)

  const totalGeneral = todasLasFilas.reduce(
    (sum, item) => sum + (item.totalEnElAnio ?? 0),
    0
  )

  const hayDatos = data && data.length > 0

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>
          Jugadores habilitados por agrupador de torneo
        </h1>
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
              titulo='Año'
              opciones={anios()}
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
          ) : hayDatos ? (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agrupador de torneo</TableHead>
                    <TableHead>Torneo</TableHead>
                    {columnasMeses.map(({ key, label }) => (
                      <TableHead key={key} className='text-right'>
                        {label}
                      </TableHead>
                    ))}
                    <TableHead className='text-right'>
                      Total en el año
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.map((agrupador, agrupadorIndex) => {
                    const torneos = agrupador.torneos ?? []
                    const subtotales = sumarMeses(torneos)
                    const subtotalAnual = torneos.reduce(
                      (sum, torneo) => sum + (torneo.totalEnElAnio ?? 0),
                      0
                    )

                    return (
                      <Fragment key={agrupadorIndex}>
                        {torneos.map((torneo, torneoIndex) => (
                          <TableRow key={`${agrupadorIndex}-${torneoIndex}`}>
                            {torneoIndex === 0 && (
                              <TableCell
                                rowSpan={torneos.length + 1}
                                className='align-top font-medium bg-slate-50'
                              >
                                {agrupador.nombreAgrupador}
                              </TableCell>
                            )}
                            <TableCell>{torneo.nombreTorneo}</TableCell>
                            {columnasMeses.map(({ key }) => (
                              <TableCell key={key} className='text-right'>
                                {obtenerValorMes(torneo, key)}
                              </TableCell>
                            ))}
                            <TableCell className='text-right font-medium'>
                              {torneo.totalEnElAnio}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className='font-semibold bg-slate-50'>
                          <TableCell>Subtotal</TableCell>
                          {columnasMeses.map(({ key }) => (
                            <TableCell key={key} className='text-right'>
                              {subtotales[key]}
                            </TableCell>
                          ))}
                          <TableCell className='text-right'>
                            {subtotalAnual}
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    )
                  })}
                  <TableRow className='font-bold'>
                    <TableCell colSpan={2}>Total</TableCell>
                    {columnasMeses.map(({ key }) => (
                      <TableCell key={key} className='text-right'>
                        {totalesPorMes[key]}
                      </TableCell>
                    ))}
                    <TableCell className='text-right'>{totalGeneral}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <MensajeListaVacia mensaje='No hay datos para mostrar con los filtros seleccionados' />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
