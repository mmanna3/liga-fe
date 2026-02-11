import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: number
  maxStepReached?: number
  totalSteps: number
  onStepClick?: (step: number) => void
}

const steps = [
  { number: 1, title: 'Información', shortTitle: 'Info' },
  { number: 2, title: 'Fases', shortTitle: 'Fases' },
  { number: 3, title: 'Equipos', shortTitle: 'Equipos' },
  { number: 4, title: 'Zonas', shortTitle: 'Zonas' },
  { number: 5, title: 'Fixture', shortTitle: 'Fixture' },
  { number: 6, title: 'Resumen', shortTitle: 'Resumen' }
]

export function StepIndicator({
  currentStep,
  maxStepReached = 6,
  totalSteps,
  onStepClick
}: StepIndicatorProps) {
  return (
    <div className='w-full overflow-x-auto'>
      <div className='flex items-center justify-between min-w-max md:min-w-0 px-2'>
        {steps.slice(0, totalSteps).map((step, index) => (
          <div key={step.number} className='flex items-center flex-1 min-w-0'>
            <div className='flex flex-col items-center flex-shrink-0'>
              <button
                type='button'
                onClick={() => onStepClick?.(step.number)}
                disabled={
                  !onStepClick ||
                  (step.number > currentStep && step.number > maxStepReached)
                }
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  currentStep > step.number &&
                    'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer',
                  currentStep === step.number &&
                    'bg-primary text-primary-foreground ring-2 ring-primary/20',
                  currentStep < step.number &&
                    'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer',
                  step.number > currentStep &&
                    step.number <= maxStepReached &&
                    'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer',
                  step.number > maxStepReached &&
                    'bg-muted text-muted-foreground cursor-not-allowed opacity-60',
                  !onStepClick && 'cursor-default',
                  'disabled:cursor-not-allowed'
                )}
              >
                {currentStep > step.number ? (
                  <Check className='w-4 h-4' />
                ) : (
                  step.number
                )}
              </button>
              <span
                className={cn(
                  'mt-1.5 text-xs font-medium text-center whitespace-nowrap',
                  currentStep >= step.number
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <span className='hidden sm:inline'>{step.title}</span>
                <span className='sm:hidden'>{step.shortTitle}</span>
              </span>
            </div>

            {index < totalSteps - 1 && (
              <div className='flex-1 h-0.5 mx-1.5 -mt-5'>
                <div
                  className={cn(
                    'h-full rounded transition-all',
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
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
