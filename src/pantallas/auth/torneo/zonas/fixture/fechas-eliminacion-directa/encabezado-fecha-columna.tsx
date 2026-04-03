import { api } from '@/api/api'
import type { FechaDTO, FechaEliminacionDirectaDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Calendario } from '@/design-system/ykn-ui/calendario'
import Icono from '@/design-system/ykn-ui/icono'
import { cn, toDateOnly } from '@/logica-compartida/utils'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function EncabezadoFechaColumna({
  fecha,
  diaMostrado,
  zonaId
}: {
  fecha: FechaEliminacionDirectaDTO | undefined
  diaMostrado: Date | undefined
  zonaId: number
}) {
  const queryClient = useQueryClient()

  const label =
    diaMostrado != null
      ? format(toDateOnly(diaMostrado), "EEEE d 'de' MMMM", { locale: es })
      : '—'

  const actualizarDiaMutation = useApiMutation<Date>({
    fn: (nuevoDia) => {
      if (!fecha?.id) return Promise.resolve()
      const dia = toDateOnly(nuevoDia)
      return api.fechasPUT(zonaId, fecha.id, {
        ...fecha,
        dia
      } as unknown as FechaDTO)
    },
    mensajeDeExito: 'Fecha actualizada',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      queryClient.invalidateQueries({
        queryKey: ['fechasEliminacionDirecta', zonaId]
      })
    }
  })

  function handleSelect(date: Date | undefined) {
    if (date == null || !fecha?.id) return
    actualizarDiaMutation.mutate(date)
  }

  if (!fecha?.id) {
    return <p className='text-xs text-muted-foreground'>{label}</p>
  }

  const diaParaCalendario = fecha.dia ?? diaMostrado

  return (
    <Calendario
      selected={diaParaCalendario}
      onSelect={handleSelect}
      trigger={
        <button
          type='button'
          disabled={actualizarDiaMutation.isPending}
          aria-label='Editar fecha'
          className={cn(
            'group mx-auto flex w-full max-w-full items-center justify-center gap-1 text-center',
            'text-xs text-muted-foreground transition-colors',
            'hover:text-primary disabled:opacity-50'
          )}
        >
          <span className='mr-1 min-w-0 truncate group-hover:text-primary'>
            {label}
          </span>
          <Icono
            nombre='Editar'
            className='size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary'
            aria-hidden
          />
        </button>
      }
    />
  )
}
