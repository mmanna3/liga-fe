import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormContext } from 'react-hook-form'
import type { TournamentWizardData, Zone } from '../types'

interface TablaConfigZonasProps {
  zonesWithTeams: (Zone & { freeDates?: number; interzonalDates?: number })[]
  hasMultipleZones: boolean
}

export function TablaConfigZonas({
  zonesWithTeams,
  hasMultipleZones
}: TablaConfigZonasProps) {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const zones = watch('zones') as (Zone & { freeDates?: number })[]

  const handleFreeDatesChange = (zoneId: string, value: number) => {
    setValue(
      'zones',
      zones.map((z) => (z.id === zoneId ? { ...z, freeDates: value } : z))
    )
    setValue('fixtureGenerated', false)
  }

  const handleInterzonalChange = (zoneId: string, value: number) => {
    setValue(
      'zones',
      zones.map((z) =>
        z.id === zoneId ? { ...z, interzonalDates: value } : z
      )
    )
    setValue('fixtureGenerated', false)
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
              {hasMultipleZones && (
                <th className='py-1.5 pl-3 font-medium text-muted-foreground text-center w-20'>
                  Interzonal
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {zonesWithTeams.map((zone) => (
              <tr key={zone.id} className='border-b last:border-0'>
                <td className='py-1.5 pr-3'>
                  <Label className='text-sm'>{zone.name}</Label>
                </td>
                <td className='py-1.5 px-3 text-center text-muted-foreground'>
                  {zone.teams.length}
                </td>
                <td className='py-1.5 px-3'>
                  <Input
                    type='number'
                    min={0}
                    className='h-8 w-16 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    value={zone.freeDates ?? 0}
                    onChange={(e) =>
                      handleFreeDatesChange(
                        zone.id,
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                  />
                </td>
                {hasMultipleZones && (
                  <td className='py-1.5 pl-3'>
                    <Input
                      type='number'
                      min={0}
                      className='h-8 w-16 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                      value={zone.interzonalDates ?? 0}
                      onChange={(e) =>
                        handleInterzonalChange(
                          zone.id,
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
        {hasMultipleZones
          ? 'Cada zona puede tener distinta cantidad de fechas libres. Las interzonales deben coincidir entre zonas.'
          : 'Cada zona puede tener distinta cantidad de fechas libres.'}
      </p>
    </div>
  )
}
