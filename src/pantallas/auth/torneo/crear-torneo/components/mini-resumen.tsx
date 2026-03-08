import { Badge } from '@/design-system/base-ui/badge'
import { useFormContext } from 'react-hook-form'
import type { DatosWizardTorneo } from '../tipos'

interface MiniResumenProps {
  children?: React.ReactNode
}

export function MiniResumen({ children }: MiniResumenProps) {
  const { watch } = useFormContext<DatosWizardTorneo>()

  const nombre = watch('nombre')
  const categorias = watch('categorias')
  const fases = watch('fases')
  const indiceFaseActual = watch('indiceFaseActual')
  const equiposSeleccionados = watch('equiposSeleccionados')

  const faseActual =
    fases.length > 0 ? (fases[indiceFaseActual] ?? fases[0]) : null
  const esEliminacion = faseActual?.formato === 'eliminacion'
  const categoriasConNombre = categorias.filter((c) => c.nombre)

  const tieneDatosFase = faseActual != null
  const tieneCantidadEquipos = equiposSeleccionados.length > 0

  return (
    <div className='bg-primary/10 rounded-lg p-4'>
      <h3 className='font-semibold text-foreground mb-1'>
        {nombre || 'Nombre del torneo'}
      </h3>

      {categoriasConNombre.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-2'>
          {categoriasConNombre.map((categoria) => (
            <Badge
              key={categoria.id}
              variant='secondary'
              className='bg-primary/10 text-primary border-primary/20 text-xs'
            >
              {categoria.nombre}
              {(categoria.anioDesde || categoria.anioHasta) && (
                <span className='ml-1'>
                  ({categoria.anioDesde || '—'}/{categoria.anioHasta || '—'})
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}

      {(tieneDatosFase || tieneCantidadEquipos) && (
        <p className='text-sm text-muted-foreground'>
          {tieneDatosFase && (
            <>
              Fase:{' '}
              <span className='font-semibold text-foreground'>
                {faseActual.nombre}
              </span>
            </>
          )}
          {tieneDatosFase && (
            <>
              {' - '}
              <span>
                {esEliminacion ? 'Eliminación directa' : 'Todos contra todos'}
              </span>
              {' - '}
              <span>
                {faseActual.vueltas === 'ida' ? 'Ida' : 'Ida y vuelta'}
              </span>
            </>
          )}
          {tieneCantidadEquipos && (
            <>
              {tieneDatosFase && ' - '}
              <span className='font-semibold'>
                {equiposSeleccionados.length} equipos
              </span>
            </>
          )}
        </p>
      )}

      {children}
    </div>
  )
}
