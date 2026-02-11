import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface CajitaConTickProps {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

export default function CajitaConTick({
  id,
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className
}: CajitaConTickProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background cursor-pointer hover:bg-accent/50 transition-colors text-sm text-foreground',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
        disabled={disabled}
        className='h-4 w-4 shrink-0'
      />
      <span className='text-sm'>{label}</span>
    </label>
  )
}
