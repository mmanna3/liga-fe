import { Calendar, CalendarDayButton } from '@/design-system/base-ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/design-system/base-ui/popover'
import { cn } from '@/logica-compartida/utils'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

export { CalendarDayButton as CalendarioDiaBoton }

const LOCALE_ES = {
  code: 'es',
  formatLong: es.formatLong,
  localize: es.localize,
  match: es.match,
  options: es.options
}

function formatearFecha(date: Date | undefined): string {
  if (!date) return ''
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function Calendario({
  selected,
  onSelect,
  className
}: {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-left',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-ring',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className='size-4 shrink-0 opacity-50' />
          <span>
            {selected ? formatearFecha(selected) : 'Seleccioná una fecha'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selected}
          onSelect={(date) => {
            onSelect?.(date)
            setOpen(false)
          }}
          locale={LOCALE_ES}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
