import { Boton } from '@/design-system/ykn-ui/boton'
import type { EquipoWizard } from '../tipos'

interface TablaEquiposProps {
  equipos: EquipoWizard[]
  mostrarColumnasTorneo: boolean
  cantidadEquipos: number
  cantidadSeleccionados: number
  alSeleccionarEquipo: (equipo: EquipoWizard) => void
}

export function TablaEquipos({
  equipos,
  mostrarColumnasTorneo,
  cantidadEquipos,
  cantidadSeleccionados,
  alSeleccionarEquipo
}: TablaEquiposProps) {
  const equiposMostrados = equipos.slice(0, 50)

  if (equipos.length === 0) {
    return (
      <div className='p-8 text-center text-muted-foreground'>
        No se encontraron equipos
      </div>
    )
  }

  return (
    <table className='w-full'>
      <thead className='bg-muted sticky top-0'>
        <tr>
          <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
            Código
          </th>
          <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
            Nombre
          </th>
          <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
            Club
          </th>
          {mostrarColumnasTorneo && (
            <>
              <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                Torneo
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
                Zona
              </th>
            </>
          )}
          <th className='px-4 py-3 text-left text-xs font-medium text-muted-foreground'>
            Acción
          </th>
        </tr>
      </thead>
      <tbody className='divide-y'>
        {equiposMostrados.map((equipo) => (
          <tr key={equipo.id} className='hover:bg-muted/50 transition-colors'>
            <td className='px-4 py-3 text-sm text-muted-foreground'>
              {equipo.id}
            </td>
            <td className='px-4 py-3 text-sm font-medium'>{equipo.nombre}</td>
            <td className='px-4 py-3 text-sm text-muted-foreground'>
              {equipo.club}
            </td>
            {mostrarColumnasTorneo && (
              <>
                <td className='px-4 py-3 text-sm text-muted-foreground'>
                  {equipo.torneo}
                </td>
                <td className='px-4 py-3 text-sm text-muted-foreground'>
                  {equipo.zona || '-'}
                </td>
              </>
            )}
            <td className='px-4 py-3'>
              <Boton
                type='button'
                size='sm'
                onClick={() => alSeleccionarEquipo(equipo)}
                disabled={cantidadSeleccionados >= cantidadEquipos}
              >
                Seleccionar
              </Boton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
