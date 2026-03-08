import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { useFormContext } from 'react-hook-form'
import type { DatosWizardTorneo, Zona } from '../tipos'

interface TablaConfigZonasProps {
  zonasConEquipos: (Zona & {
    fechasLibres?: number
    fechasInterzonales?: number
  })[]
  tieneMultiplesZonas: boolean
}

export function TablaConfigZonas({
  zonasConEquipos,
  tieneMultiplesZonas
}: TablaConfigZonasProps) {
  const { watch, setValue } = useFormContext<DatosWizardTorneo>()
  const zonas = watch('zonas') as (Zona & { fechasLibres?: number })[]

  const alCambiarFechasLibres = (zonaId: string, valor: number) => {
    setValue(
      'zonas',
      zonas.map((z) => (z.id === zonaId ? { ...z, fechasLibres: valor } : z))
    )
    setValue('fixtureGenerado', false)
  }

  const alCambiarInterzonal = (zonaId: string, valor: number) => {
    setValue(
      'zonas',
      zonas.map((z) =>
        z.id === zonaId ? { ...z, fechasInterzonales: valor } : z
      )
    )
    setValue('fixtureGenerado', false)
  }

  return (
    <div className='space-y-3'>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b text-left'>
              <th className='py-1.5 pr-3 font-medium text-muted-foreground'>
                Zona
              </th>
              <th className='py-1.5 px-3 font-medium text-muted-foreground text-center w-20'>
                Equipos
              </th>
              <th className='py-1.5 px-3 font-medium text-muted-foreground text-center w-20'>
                Libre
              </th>
              {tieneMultiplesZonas && (
                <th className='py-1.5 pl-3 font-medium text-muted-foreground text-center w-20'>
                  Interzonal
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {zonasConEquipos.map((zona) => (
              <tr key={zona.id} className='border-b last:border-0'>
                <td className='py-1.5 pr-3'>
                  <Label className='text-sm'>{zona.nombre}</Label>
                </td>
                <td className='py-1.5 px-3 text-center text-muted-foreground'>
                  {zona.equipos.length}
                </td>
                <td className='py-1.5 px-3'>
                  <Input
                    type='number'
                    min={0}
                    className='h-8 w-16 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    value={zona.fechasLibres ?? 0}
                    onChange={(e) =>
                      alCambiarFechasLibres(
                        zona.id,
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                  />
                </td>
                {tieneMultiplesZonas && (
                  <td className='py-1.5 pl-3'>
                    <Input
                      type='number'
                      min={0}
                      className='h-8 w-16 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                      value={zona.fechasInterzonales ?? 0}
                      onChange={(e) =>
                        alCambiarInterzonal(
                          zona.id,
                          Math.max(0, parseInt(e.target.value) || 0)
                        )
                      }
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='text-xs text-muted-foreground'>
        {tieneMultiplesZonas
          ? 'Cada zona puede tener distinta cantidad de fechas libres. Las interzonales deben coincidir entre zonas.'
          : 'Cada zona puede tener distinta cantidad de fechas libres.'}
      </p>
    </div>
  )
}
