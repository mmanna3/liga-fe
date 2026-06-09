import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import { Label } from '@/design-system/base-ui/label'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'

interface SelectorAgrupadoresMultiplesProps {
  valor: number[]
  alCambiar: (ids: number[]) => void
  titulo?: string
  deshabilitado?: boolean
}

export default function SelectorAgrupadoresMultiples({
  valor,
  alCambiar,
  titulo = 'Agrupadores de torneo',
  deshabilitado = false
}: SelectorAgrupadoresMultiplesProps) {
  const { data: agrupadores = [], isLoading } = useApiQuery({
    key: ['torneoAgrupadorAll'],
    fn: () => api.torneoAgrupadorAll()
  })

  const toggle = (id: number, checked: boolean) => {
    if (checked) {
      alCambiar([...valor, id])
    } else {
      alCambiar(valor.filter((v) => v !== id))
    }
  }

  if (isLoading) {
    return (
      <div>
        <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
        <p className='text-sm text-muted-foreground'>Cargando agrupadores...</p>
      </div>
    )
  }

  if (agrupadores.length === 0) {
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
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
        {agrupadores.map((agrupador) => {
          const id = agrupador.id ?? 0
          return (
            <CajitaConTick
              key={id}
              id={`agrupador-${id}`}
              checked={valor.includes(id)}
              onCheckedChange={(checked) => toggle(id, checked)}
              label={agrupador.nombre ?? ''}
              disabled={deshabilitado}
            />
          )
        })}
      </div>
    </div>
  )
}
