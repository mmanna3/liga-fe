import { cn } from '@/logica-compartida/utils'

export function IconoTarjetaArbitro({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={cn(className)}
      aria-hidden
    >
      {/* Tarjeta de atrás: solo los bordes que asoman */}
      <path d='M 6.5 2 H 11.5 A 1.5 1.5 0 0 1 13 3.5 V 5' />
      <path d='M 6.5 2 A 1.5 1.5 0 0 0 5 3.5 V 14.5 A 1.5 1.5 0 0 0 6.5 16 H 9' />
      {/* Tarjeta de adelante */}
      <rect x='9' y='5' width='8' height='14' rx='1.5' />
    </svg>
  )
}
