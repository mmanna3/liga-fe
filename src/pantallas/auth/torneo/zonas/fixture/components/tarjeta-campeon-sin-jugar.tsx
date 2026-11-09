import { Card, CardContent } from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'
import type { ReactNode } from 'react'

/** Zona de eliminación directa de un único equipo: no hay partidos, el equipo es campeón directo. */
export function TarjetaCampeonSinJugar({
  equipo,
  acciones
}: {
  equipo: string
  acciones?: ReactNode
}) {
  return (
    <Card className='max-w-sm mx-auto'>
      <CardContent className='flex flex-col items-center gap-2 py-6'>
        <Icono nombre='Torneos' className='size-10 text-amber-500' />
        <p className='text-base font-semibold text-center'>{equipo}</p>
        <p className='text-xs font-semibold uppercase tracking-wide text-amber-600'>
          Campeón
        </p>
        <p className='text-xs text-muted-foreground text-center'>
          Es el único equipo de la zona, así que no hay partidos.
        </p>
        {acciones}
      </CardContent>
    </Card>
  )
}
