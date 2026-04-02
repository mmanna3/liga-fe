import {
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'

interface ZonaHeaderProps {
  nombreTorneo?: string
  nombreFase?: string
  formatoFase?: string
}

export function ZonaHeader({
  nombreTorneo,
  nombreFase,
  formatoFase
}: ZonaHeaderProps) {
  return (
    <CardHeader className='pb-2'>
      <CardTitle className='text-2xl font-semibold text-gray-900 flex gap-2'>
        <Icono nombre='Zonas' className='h-6 w-6 mt-1' />
        Zonas
      </CardTitle>
      <CardDescription className='text-base mt-1'>
        {nombreTorneo ?? '—'} · {nombreFase ?? '—'} · {formatoFase ?? '—'}
      </CardDescription>
    </CardHeader>
  )
}
