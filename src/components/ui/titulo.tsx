import { ReactNode } from 'react'

interface TituloProps {
  children: ReactNode
}

export default function Titulo({ children }: TituloProps) {
  return (
    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
      {children}
    </h1>
  )
}
