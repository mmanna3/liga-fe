import { api } from '@/api/api'
import { useQuery } from '@tanstack/react-query'
import { Label } from '@/design-system/base-ui/label'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'

interface SelectorAgrupadorProps {
  valor: number | null
  alCambiar: (id: number | null) => void
  titulo?: string
  error?: string
  deshabilitado?: boolean
}

export function SelectorAgrupador({
  valor,
  alCambiar,
  titulo = 'Agrupador *',
  error,
  deshabilitado = false
}: SelectorAgrupadorProps) {
  const { data: agrupadores = [], isLoading } = useQuery({
    queryKey: ['torneoAgrupadorAll'],
    queryFn: () => api.torneoAgrupadorAll()
  })

  const opciones = agrupadores.map((a) => ({
    id: String(a.id ?? 0),
    titulo: a.nombre
  }))

  const valorActual = valor != null ? String(valor) : ''

  if (isLoading) {
    return (
      <div>
        <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
        <p className='text-sm text-muted-foreground'>Cargando agrupadores...</p>
      </div>
    )
  }

  if (opciones.length === 0) {
    return (
      <div>
        <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
        <p className='text-sm text-muted-foreground'>
          No hay agrupadores. Creá uno primero en la sección de agrupadores.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
      <SelectorSimple
        opciones={opciones}
        valorActual={valorActual}
        alElegirOpcion={(id) => alCambiar(id ? parseInt(id, 10) : null)}
        deshabilitado={deshabilitado}
        columnasPorRenglon={3}
      />
      {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
    </div>
  )
}
