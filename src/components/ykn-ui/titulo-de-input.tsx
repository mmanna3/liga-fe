import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from '../ui/label'

interface TituloDeInputProps {
  children: ReactNode
  htmlFor?: string
  className?: string
}

export default function TituloDeInput({
  children,
  htmlFor,
  className
}: TituloDeInputProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn('block mb-3 text-md font-semibold', className)}
    >
      {children}
    </Label>
  )
}
