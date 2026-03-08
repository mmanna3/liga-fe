import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { EstadoDelegado } from '@/lib/utils'
import { SlidersHorizontal } from 'lucide-react'

interface FiltroProps {
  filtroEstados: EstadoDelegado[]
  onToggle: (estado: EstadoDelegado) => void
  opciones: { key: EstadoDelegado; label: string }[]
}

export default function Filtro({
  filtroEstados,
  onToggle,
  opciones
}: FiltroProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Filtrar por estado'
          className='inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background p-2 text-sm hover:bg-accent cursor-pointer'
        >
          <SlidersHorizontal className='h-4 w-4 shrink-0' />
          {filtroEstados.length > 0 && (
            <span className='bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
              {filtroEstados.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-48 flex flex-col gap-1'>
        {opciones.map(({ key, label }) => (
          <div
            key={key}
            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md ${
              filtroEstados.includes(key) ? 'bg-blue-100' : ''
            }`}
            onClick={() => onToggle(key)}
          >
            <span className='text-sm'>{label}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
