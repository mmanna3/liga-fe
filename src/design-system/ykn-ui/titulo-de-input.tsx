import { cn } from '@/logica-compartida/utils'
import { ReactNode } from 'react'
import { Label } from '@/design-system/base-ui/label'

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
      className={cn('block mb-2 text-md font-semibold', className)}
    >
      {children}
    </Label>
  )
}
