import { Label } from '@/design-system/base-ui/label'
import Icono, { type NombreIcono } from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
import type { DatosWizardTorneo } from '../tipos'

export type FormatoTorneo = DatosWizardTorneo['formato']

const OPCIONES_FORMATO: {
  id: FormatoTorneo
  label: string
  icono: NombreIcono
}[] = [
  { id: 'ANUAL', label: 'Apertura/Clausura', icono: 'Apertura/Clausura' },
  { id: 'MUNDIAL', label: 'Mundial', icono: 'Mundial' },
  { id: 'RELAMPAGO', label: 'Eliminación directa', icono: 'Relámpago' },
  { id: 'PERSONALIZADO', label: 'Personalizado', icono: 'Personalizado' }
]

interface SelectorFormatoProps {
  valor: FormatoTorneo
  alCambiar: (formato: FormatoTorneo) => void
  titulo?: string
  error?: string
  deshabilitado?: boolean
}

export function SelectorFormato({
  valor,
  alCambiar,
  titulo = 'Formato *',
  error,
  deshabilitado = false
}: SelectorFormatoProps) {
  return (
    <div>
      <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {OPCIONES_FORMATO.map((formato) => (
          <button
            key={formato.id}
            type='button'
            onClick={() => !deshabilitado && alCambiar(formato.id)}
            disabled={deshabilitado}
            className={cn(
              'aspect-square rounded-lg transition-all border-2 flex flex-col items-center justify-center gap-2 p-3',
              valor === formato.id
                ? 'bg-primary/10 border-primary'
                : 'bg-muted border-transparent hover:border-border'
            )}
          >
            <Icono
              nombre={formato.icono}
              className={cn(
                'w-10 h-10',
                valor === formato.id ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <p
              className={cn(
                'text-sm font-medium leading-tight',
                valor === formato.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {formato.label}
            </p>
          </button>
        ))}
      </div>
      {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
    </div>
  )
}
