import { api } from '@/api/api'
import {
  ReporteJugadoresActivosEquipoDTO,
  ReporteJugadoresActivosPorAgrupadorDeTorneoDTO,
  ReporteJugadoresActivosTorneoDTO
} from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/design-system/base-ui/table'
import { Boton } from '@/design-system/ykn-ui/boton'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const descripcionReporte =
  'Muestra cuántos jugadores están en estado Activo en este momento, desglosados por agrupador y torneo del año seleccionado. Solo incluye jugadores cuyo equipo está inscripto en una zona de un torneo de ese año. Opcionalmente se puede ver la cantidad por cada equipo.'

const anios = () => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }))
}

type FilaTabla =
  | {
      tipo: 'torneo'
      agrupadorIndex: number
      torneoIndex: number
      nombreAgrupador: string
      torneo: ReporteJugadoresActivosTorneoDTO
      cantidadEquipos: number
    }
  | {
      tipo: 'equipo'
      agrupadorIndex: number
      torneoIndex: number
      equipoIndex: number
      equipo: ReporteJugadoresActivosEquipoDTO
    }

export default function ReporteJugadoresActivosPorTorneoPage() {
  const navigate = useNavigate()
  const [anio, setAnio] = useState<string>(new Date().getFullYear() + '')
  const [mostrarEquipos, setMostrarEquipos] = useState(false)

  const { data, isLoading, refetch } = useApiQuery<
    ReporteJugadoresActivosPorAgrupadorDeTorneoDTO[]
  >({
    key: ['reporte-jugadores-activos-por-torneo', anio, String(mostrarEquipos)],
    fn: async () => {
      return await api.obtenerReporteJugadoresActivosPorTorneo(
        parseInt(anio),
        mostrarEquipos
      )
    }
  })

  const todasLasFilas =
    data?.flatMap((agrupador) => agrupador.torneos ?? []) ?? []

  const totalGeneral = todasLasFilas.reduce(
    (sum, item) => sum + (item.cantidadJugadoresActivos ?? 0),
    0
  )

  const hayDatos = data && data.length > 0

  const filasTabla: FilaTabla[] =
    data?.flatMap((agrupador, agrupadorIndex) =>
      (agrupador.torneos ?? []).flatMap((torneo, torneoIndex) => {
        const filas: FilaTabla[] = [
          {
            tipo: 'torneo',
            agrupadorIndex,
            torneoIndex,
            nombreAgrupador: agrupador.nombreAgrupador ?? '',
            torneo,
            cantidadEquipos: torneo.equipos?.length ?? 0
          }
        ]

        if (mostrarEquipos) {
          ;(torneo.equipos ?? []).forEach((equipo, equipoIndex) => {
            filas.push({
              tipo: 'equipo',
              agrupadorIndex,
              torneoIndex,
              equipoIndex,
              equipo
            })
          })
        }

        return filas
      })
    ) ?? []

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>Jugadores activos por torneo</h1>
          <p className='text-sm text-muted-foreground max-w-3xl'>
            {descripcionReporte}
          </p>
        </div>
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
            className='flex flex-col md:flex-row gap-4 items-end'
          >
            <ListaDesplegable
              titulo='Año'
              opciones={anios()}
              valor={anio}
              alCambiar={setAnio}
              placeholder='Seleccionar año'
              className='w-36'
            />
            <CajitaConTick
              id='mostrar-equipos'
              checked={mostrarEquipos}
              onCheckedChange={setMostrarEquipos}
              label='Mostrar equipos'
            />
            <Boton type='submit'>Filtrar</Boton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            {mostrarEquipos
              ? 'Cantidad de jugadores activos por torneo y por equipo'
              : 'Cantidad de jugadores activos por torneo'}
          </CardDescription>
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
                    {mostrarEquipos && <TableHead>Equipo</TableHead>}
                    <TableHead className='text-right'>
                      Jugadores activos
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.map((agrupador, agrupadorIndex) => {
                    const torneos = agrupador.torneos ?? []
                    const subtotal = torneos.reduce(
                      (sum, torneo) =>
                        sum + (torneo.cantidadJugadoresActivos ?? 0),
                      0
                    )
                    const filasAgrupador = filasTabla.filter(
                      (f) => f.agrupadorIndex === agrupadorIndex
                    )
                    const rowspanAgrupador = filasAgrupador.length + 1

                    return (
                      <Fragment key={agrupadorIndex}>
                        {filasAgrupador.map((fila, filaIndex) => {
                          if (fila.tipo === 'torneo') {
                            return (
                              <TableRow
                                key={`t-${agrupadorIndex}-${fila.torneoIndex}`}
                                className={
                                  mostrarEquipos
                                    ? 'font-medium bg-slate-50'
                                    : ''
                                }
                              >
                                {filaIndex === 0 && (
                                  <TableCell
                                    rowSpan={rowspanAgrupador}
                                    className='align-top font-medium bg-slate-50'
                                  >
                                    {fila.nombreAgrupador}
                                  </TableCell>
                                )}
                                <TableCell>
                                  {fila.torneo.nombreTorneo}
                                </TableCell>
                                {mostrarEquipos && (
                                  <TableCell className='text-muted-foreground'>
                                    {fila.cantidadEquipos} equipo
                                    {fila.cantidadEquipos === 1 ? '' : 's'}
                                  </TableCell>
                                )}
                                <TableCell className='text-right font-medium'>
                                  {fila.torneo.cantidadJugadoresActivos}
                                </TableCell>
                              </TableRow>
                            )
                          }

                          return (
                            <TableRow
                              key={`e-${agrupadorIndex}-${fila.torneoIndex}-${fila.equipoIndex}`}
                            >
                              <TableCell />
                              <TableCell>{fila.equipo.nombreEquipo}</TableCell>
                              <TableCell className='text-right'>
                                {fila.equipo.cantidadJugadoresActivos}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow className='font-semibold bg-slate-50'>
                          <TableCell colSpan={mostrarEquipos ? 2 : 1}>
                            Subtotal
                          </TableCell>
                          <TableCell className='text-right'>
                            {subtotal}
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    )
                  })}
                  <TableRow className='font-bold'>
                    <TableCell colSpan={mostrarEquipos ? 3 : 2}>
                      Total
                    </TableCell>
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
