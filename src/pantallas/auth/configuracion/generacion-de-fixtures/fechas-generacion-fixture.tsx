import { api } from '@/api/api'
import type { FixtureAlgoritmoFechaDTO } from '@/api/clients'
import {
  Card,
  CardContent,
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
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

function agruparPorFecha(
  fechas: FixtureAlgoritmoFechaDTO[] | undefined
): Map<number, FixtureAlgoritmoFechaDTO[]> {
  const mapa = new Map<number, FixtureAlgoritmoFechaDTO[]>()
  if (!fechas) return mapa
  for (const f of fechas) {
    const lista = mapa.get(f.fecha) ?? []
    lista.push(f)
    mapa.set(f.fecha, lista)
  }
  return mapa
}

export default function FechasGeneracionFixture() {
  const { id } = useParams<{ id: string }>()
  const idNum = Number(id)

  const { data, isLoading } = useQuery({
    queryKey: ['fixtureAlgoritmo', idNum],
    queryFn: () => api.fixtureAlgoritmoGET(idNum),
    enabled: Number.isFinite(idNum)
  })

  const N = data?.cantidadDeEquipos ?? 0
  const numFechas = Math.max(0, N - 1)
  const filasPorFecha = N > 0 ? Math.floor(N / 2) : 0
  const fechasPorNumero = agruparPorFecha(data?.fechas)

  const contenido = isLoading ? (
    <p className='text-sm text-muted-foreground italic text-center py-4'>
      Cargando…
    </p>
  ) : !data ? (
    <p className='text-sm text-muted-foreground italic text-center py-4'>
      No se encontró el algoritmo.
    </p>
  ) : (
    <div className='grid grid-cols-3 gap-4 py-6'>
      {Array.from({ length: numFechas }, (_, i) => i + 1).map((numFecha) => {
        const filas = fechasPorNumero.get(numFecha) ?? []
        return (
          <Card key={numFecha}>
            <CardHeader>
              <CardTitle>FECHA {numFecha}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOCAL</TableHead>
                    <TableHead>VISITANTE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: filasPorFecha }, (_, i) => {
                    const par = filas[i]
                    return (
                      <TableRow key={i}>
                        <TableCell>
                          {par != null ? par.equipoLocal : ''}
                        </TableCell>
                        <TableCell>
                          {par != null ? par.equipoVisitante : ''}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <FlujoHomeLayout
      titulo={`Generación de fixture · ${N} equipos`}
      subtitulo={`Usá los números desde el 1 hasta el ${N} para indicar cómo se van a generar las fechas en zonas con este número de equipos.`}
      iconoTitulo='Fixture'
      pathBotonVolver={rutasNavegacion.generacionDeFixtures}
      contenidoEnCard={false}
      contenido={contenido}
    />
  )
}
