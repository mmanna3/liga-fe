import { Boton } from '@/design-system/ykn-ui/boton'
import { Layers, Plus } from 'lucide-react'

interface BotoneraFasesProps {
  onAgregarFase: () => void
  onAgregarGrupoDeFases: () => void
  estaCargandoFase: boolean
}

export function BotoneraFases({
  onAgregarFase,
  onAgregarGrupoDeFases,
  estaCargandoFase
}: BotoneraFasesProps) {
  return (
    <div className='flex flex-wrap gap-2 my-2'>
      <Boton
        type='button'
        variant='outline'
        size='sm'
        onClick={onAgregarFase}
        estaCargando={estaCargandoFase}
      >
        <Plus className='w-3 h-3' />
        Agregar fase
      </Boton>
      <Boton
        type='button'
        variant='outline'
        size='sm'
        onClick={onAgregarGrupoDeFases}
      >
        <Layers className='w-3 h-3' />
        Agregar grupo de fases
      </Boton>
    </div>
  )
}
