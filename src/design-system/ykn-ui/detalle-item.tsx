import type { NombreIcono } from '@/design-system/ykn-ui/icono'
import Icono from '@/design-system/ykn-ui/icono'

interface Props {
  clave?: string
  valor: string
  icono?: NombreIcono
}

export default function DetalleItem({ clave, valor, icono }: Props) {
  return (
    <div className='flex items-center gap-2'>
      {icono ? (
        <span className='text-gray-900 shrink-0 [&>svg]:stroke-2'>
          <Icono nombre={icono} className='h-6 w-6' />
        </span>
      ) : (
        <h2 className='text-md font-bold shrink-0'>{clave}:</h2>
      )}
      <p className='text-md'>{valor}</p>
    </div>
  )
}
