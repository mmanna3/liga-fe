import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CalendarRange, Globe, Settings, Zap } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { TournamentWizardData } from '../types'
import { Categorias } from './Categorias'

export function Step1Information() {
  const { watch, setValue } = useFormContext<TournamentWizardData>()

  const data = {
    name: watch('name'),
    season: watch('season'),
    type: watch('type'),
    format: watch('format')
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <Label className='block mb-2.5'>Nombre del torneo *</Label>
          <Input
            type='text'
            value={data.name}
            onChange={(e) => setValue('name', e.target.value)}
            placeholder='Ej: Torneo Clausura 2026'
          />
        </div>
        <div>
          <Label className='block mb-2.5'>Temporada/Año *</Label>
          <Input
            type='number'
            value={data.season}
            onChange={(e) => setValue('season', e.target.value)}
            placeholder='2026'
          />
        </div>
      </div>

      <div>
        <Label className='mb-2'>Tipo *</Label>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {['FUTSAL', 'BABY', 'FUTBOL 11', 'FEMENINO'].map((type) => (
            <button
              key={type}
              type='button'
              onClick={() =>
                setValue('type', type as TournamentWizardData['type'])
              }
              className={cn(
                'rounded-lg transition-all border-2 flex items-center justify-center py-2 px-3',
                data.type === type
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-muted border-transparent text-muted-foreground hover:border-border'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <Categorias />

      <div>
        <Label className='mb-2'>Formato *</Label>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { id: 'ANUAL', label: 'Apertura/Clausura', icon: CalendarRange },
            { id: 'MUNDIAL', label: 'Mundial', icon: Globe },
            { id: 'RELAMPAGO', label: 'Eliminación directa', icon: Zap },
            { id: 'PERSONALIZADO', label: 'Personalizado', icon: Settings }
          ].map((format) => (
            <button
              key={format.id}
              type='button'
              onClick={() =>
                setValue('format', format.id as TournamentWizardData['format'])
              }
              className={cn(
                'aspect-square rounded-lg transition-all border-2 flex flex-col items-center justify-center gap-2 p-3',
                data.format === format.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted border-transparent hover:border-border'
              )}
            >
              <format.icon
                className={cn(
                  'w-10 h-10',
                  data.format === format.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <p
                className={cn(
                  'text-sm font-medium leading-tight',
                  data.format === format.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {format.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
