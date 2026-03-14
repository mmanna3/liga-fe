import type { IFixtureAlgoritmoFechaDTO } from '@/api/clients'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/design-system/base-ui/table'

function getRolesEnFecha(
  fechas: IFixtureAlgoritmoFechaDTO[],
  equipoNum: number,
  numFecha: number
): ('L' | 'V')[] {
  const roles: ('L' | 'V')[] = []
  for (const f of fechas) {
    if (f.fecha !== numFecha) continue
    if (f.equipoLocal === equipoNum) roles.push('L')
    if (f.equipoVisitante === equipoNum) roles.push('V')
  }
  return roles
}

interface TablaLocalVisitanteProps {
  fechas: IFixtureAlgoritmoFechaDTO[]
  cantidadDeEquipos: number
}

export default function TablaLocalVisitante({
  fechas,
  cantidadDeEquipos
}: TablaLocalVisitanteProps) {
  const N = cantidadDeEquipos
  const numFechas = Math.max(0, N - 1)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-24' />
          {Array.from({ length: numFechas }, (_, i) => i + 1).map(
            (numFecha) => (
              <TableHead key={numFecha} className='text-center'>
                {numFecha}
              </TableHead>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: N }, (_, i) => i + 1).map((equipoNum) => (
          <TableRow key={equipoNum}>
            <TableCell className='font-medium'>Equipo {equipoNum}</TableCell>
            {Array.from({ length: numFechas }, (_, i) => i + 1).map(
              (numFecha) => {
                const roles = getRolesEnFecha(fechas, equipoNum, numFecha)
                return (
                  <TableCell key={numFecha} className='text-center'>
                    {roles.length === 0 ? (
                      '—'
                    ) : (
                      <span className='inline-flex flex-wrap gap-1 justify-center'>
                        {roles.map((rol, idx) => (
                          <span
                            key={idx}
                            className={
                              rol === 'L'
                                ? 'bg-primary text-white border border-primary px-1.5 py-0.5 rounded text-xs font-medium'
                                : 'bg-neutral-100 border border-neutral-300 px-1.5 py-0.5 rounded text-xs font-medium'
                            }
                          >
                            {rol}
                          </span>
                        ))}
                      </span>
                    )}
                  </TableCell>
                )
              }
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
