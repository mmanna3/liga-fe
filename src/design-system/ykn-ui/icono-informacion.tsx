import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { cn } from '@/logica-compartida/utils'
import { Info } from 'lucide-react'

interface IconoInformacionProps {
  texto: string
  className?: string
}

export function IconoInformacion({ texto, className }: IconoInformacionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-full',
            'text-muted-foreground hover:text-foreground transition-colors',
            className
          )}
          aria-label='Más información'
        >
          <Info className='h-4 w-4' />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side='top'
        className='max-w-xs text-sm px-3 py-2'
        sideOffset={6}
      >
        <p>{texto}</p>
      </TooltipContent>
    </Tooltip>
  )
}
