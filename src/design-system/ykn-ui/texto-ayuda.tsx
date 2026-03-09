import { ReactNode } from 'react'

interface TextoAyudaProps {
  children: ReactNode
}

export function TextoAyuda({ children }: TextoAyudaProps) {
  return (
    <div className='p-3 bg-amber-50 rounded-lg border border-amber-200'>
      <p className='text-sm text-foreground'>{children}</p>
    </div>
  )
}
