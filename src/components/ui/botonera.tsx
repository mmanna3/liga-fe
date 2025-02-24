import { ReactNode } from 'react'

interface BotoneraProps {
  children: ReactNode
}

export default function Botonera({ children }: BotoneraProps) {
  return <div className='mt-12 mb-8'>{children}</div>
}
