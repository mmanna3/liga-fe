import { Input } from '@/design-system/ykn-ui/input'
import { useFormContext } from 'react-hook-form'
import type { DatosWizardTorneo } from '../tipos'
import { SelectorTipoTorneo } from './selector-tipo-torneo'
import { Categorias } from './categorias'
import { SelectorFormato } from './selector-formato'

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
    categorias: watch('categorias'),
    formato: watch('formato')
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <Input
          tipo='text'
          titulo='Nombre del torneo *'
          value={datos.nombre}
          onChange={(e) => setValue('nombre', e.target.value)}
          placeholder='Ej: Torneo Anual 2026'
          error={errors.nombre?.message}
        />
        <Input
          tipo='number'
          titulo='Temporada/Año *'
          value={datos.temporada}
          onChange={(e) => setValue('temporada', e.target.value)}
          placeholder='2026'
          error={errors.temporada?.message}
        />
      </div>

      <SelectorTipoTorneo
        valor={datos.tipo}
        alCambiar={(tipo) => setValue('tipo', tipo)}
        error={errors.tipo?.message}
      />

      <Categorias
        valor={datos.categorias}
        alCambiar={(categorias) => setValue('categorias', categorias)}
        error={errors.categorias?.message}
      />

      <SelectorFormato
        valor={datos.formato}
        alCambiar={(formato) => setValue('formato', formato)}
        error={errors.formato?.message}
      />
    </div>
  )
}
