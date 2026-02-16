import { Input } from '@/components/ui/input'
import TituloDeInput from '@/components/ykn-ui/titulo-de-input'
import { cn } from '@/lib/utils'
import { CalendarRange, Globe, Settings, Zap } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { TournamentWizardData } from '../types'
import { SelectorTipoTorneo } from '../../components/selector-tipo-torneo'
import { Categorias } from './Categorias'

export function Step1Information() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<TournamentWizardData>()

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
          <TituloDeInput>Nombre del torneo *</TituloDeInput>
          <Input
            type='text'
            value={data.name}
            onChange={(e) => setValue('name', e.target.value)}
            placeholder='Ej: Torneo Anual 2026'
            className={cn('h-11', errors.name && 'border-destructive')}
          />
          {errors.name && (
            <p className='text-sm text-destructive mt-1'>
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <TituloDeInput>Temporada/Año *</TituloDeInput>
          <Input
            type='number'
            value={data.season}
            onChange={(e) => setValue('season', e.target.value)}
            placeholder='2026'
            className={cn('h-11', errors.season && 'border-destructive')}
          />
          {errors.season && (
            <p className='text-sm text-destructive mt-1'>
              {errors.season.message}
            </p>
          )}
        </div>
      </div>

      <SelectorTipoTorneo
        valor={data.type}
        alCambiar={(tipo) => setValue('type', tipo)}
        error={errors.type?.message}
      />

      <Categorias />

      <div>
        <TituloDeInput>Formato *</TituloDeInput>
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
        {errors.format && (
          <p className='text-sm text-destructive mt-2'>
            {errors.format.message}
          </p>
        )}
      </div>
    </div>
  )
}
