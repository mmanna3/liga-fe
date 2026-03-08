import { Check } from 'lucide-react'
import { cn } from '@/logica-compartida/utils'

interface IndicadorDePasosProps {
  pasoActual: number
  maxPasoAlcanzado?: number
  totalPasos: number
  alClickearPaso?: (paso: number) => void
}

const pasos = [
  { numero: 1, titulo: 'Información', tituloCorto: 'Info' },
  { numero: 2, titulo: 'Fases', tituloCorto: 'Fases' },
  { numero: 3, titulo: 'Equipos', tituloCorto: 'Equipos' },
  { numero: 4, titulo: 'Zonas', tituloCorto: 'Zonas' },
  { numero: 5, titulo: 'Fixture', tituloCorto: 'Fixture' },
  { numero: 6, titulo: 'Resumen', tituloCorto: 'Resumen' }
]

export function IndicadorDePasos({
  pasoActual,
  maxPasoAlcanzado = 6,
  totalPasos,
  alClickearPaso
}: IndicadorDePasosProps) {
  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex items-center justify-between min-w-max md:min-w-0 px-2'>
        {pasos.slice(0, totalPasos).map((paso, index) => (
          <div key={paso.numero} className='flex items-center flex-1 min-w-0'>
            <div className='flex flex-col items-center flex-shrink-0'>
              <button
                type='button'
                onClick={() => alClickearPaso?.(paso.numero)}
                disabled={
                  !alClickearPaso ||
                  (paso.numero > pasoActual && paso.numero > maxPasoAlcanzado)
                }
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  pasoActual > paso.numero &&
                    'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer',
                  pasoActual === paso.numero &&
                    'bg-primary text-primary-foreground ring-2 ring-primary/20',
                  pasoActual < paso.numero &&
                    'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer',
                  paso.numero > pasoActual &&
                    paso.numero <= maxPasoAlcanzado &&
                    'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer',
                  paso.numero > maxPasoAlcanzado &&
                    'bg-muted text-muted-foreground cursor-not-allowed opacity-60',
                  !alClickearPaso && 'cursor-default',
                  'disabled:cursor-not-allowed'
                )}
              >
                {pasoActual > paso.numero ? (
                  <Check className='w-4 h-4' />
                ) : (
                  paso.numero
                )}
              </button>
              <span
                className={cn(
                  'mt-1.5 text-xs font-medium text-center whitespace-nowrap',
                  pasoActual >= paso.numero
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <span className='hidden sm:inline'>{paso.titulo}</span>
                <span className='sm:hidden'>{paso.tituloCorto}</span>
              </span>
            </div>

            {index < totalPasos - 1 && (
              <div className='flex-1 h-0.5 mx-1.5 -mt-5'>
                <div
                  className={cn(
                    'h-full rounded transition-all',
                    pasoActual > paso.numero ? 'bg-primary' : 'bg-muted'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
