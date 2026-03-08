import { Input } from '@/design-system/base-ui/input'
import TituloDeInput from '@/design-system/ykn-ui/titulo-de-input'
import { cn } from '@/logica-compartida/utils'
import { CalendarRange, Globe, Settings, Zap } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { DatosWizardTorneo } from '../tipos'
import { SelectorTipoTorneo } from './selector-tipo-torneo'
import { Categorias } from './categorias'

export function Paso1Informacion() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<DatosWizardTorneo>()

  const datos = {
    nombre: watch('nombre'),
    temporada: watch('temporada'),
    tipo: watch('tipo'),
    formato: watch('formato')
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <TituloDeInput>Nombre del torneo *</TituloDeInput>
          <Input
            type='text'
            value={datos.nombre}
            onChange={(e) => setValue('nombre', e.target.value)}
            placeholder='Ej: Torneo Anual 2026'
            className={cn('h-11', errors.nombre && 'border-destructive')}
          />
          {errors.nombre && (
            <p className='text-sm text-destructive mt-1'>
              {errors.nombre.message}
            </p>
          )}
        </div>
        <div>
          <TituloDeInput>Temporada/Año *</TituloDeInput>
          <Input
            type='number'
            value={datos.temporada}
            onChange={(e) => setValue('temporada', e.target.value)}
            placeholder='2026'
            className={cn('h-11', errors.temporada && 'border-destructive')}
          />
          {errors.temporada && (
            <p className='text-sm text-destructive mt-1'>
              {errors.temporada.message}
            </p>
          )}
        </div>
      </div>

      <SelectorTipoTorneo
        valor={datos.tipo}
        alCambiar={(tipo) => setValue('tipo', tipo)}
        error={errors.tipo?.message}
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
          ].map((formato) => (
            <button
              key={formato.id}
              type='button'
              onClick={() =>
                setValue('formato', formato.id as DatosWizardTorneo['formato'])
              }
              className={cn(
                'aspect-square rounded-lg transition-all border-2 flex flex-col items-center justify-center gap-2 p-3',
                datos.formato === formato.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted border-transparent hover:border-border'
              )}
            >
              <formato.icon
                className={cn(
                  'w-10 h-10',
                  datos.formato === formato.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <p
                className={cn(
                  'text-sm font-medium leading-tight',
                  datos.formato === formato.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {formato.label}
              </p>
            </button>
          ))}
        </div>
        {errors.formato && (
          <p className='text-sm text-destructive mt-2'>
            {errors.formato.message}
          </p>
        )}
      </div>
    </div>
  )
}
