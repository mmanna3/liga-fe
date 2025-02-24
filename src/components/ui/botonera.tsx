import { ReactNode } from 'react'

interface BotoneraProps {
  children: ReactNode
}

export default function Botonera({ children }: BotoneraProps) {
  return <div className='my-12'>{children}</div>
}
