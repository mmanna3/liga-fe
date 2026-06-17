import type { JornadaAsignacionDTO } from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import { cn } from '@/logica-compartida/utils'
import {
  formatearDiaCorto,
  nombreCompletoArbitro
} from '../asignacion/utilidades-asignacion'
import DetalleWhatsappHistorico from './detalle-whatsapp-historico'

interface FilaJornadaHistoricaProps {
  jornada: JornadaAsignacionDTO
}

export default function FilaJornadaHistorica({
  jornada
}: FilaJornadaHistoricaProps) {
  const arbitros = [...(jornada.arbitrosAsignados ?? [])].sort(
    (a, b) => a.orden - b.orden
  )

  return (
    <div
      className='flex flex-col gap-3 border-b border-border py-4 pl-3 last:border-b-0 lg:flex-row lg:items-start lg:justify-between'
      data-testid={`jornada-historica-${jornada.id}`}
    >
      <div className='min-w-0 flex-1 space-y-1'>
        <p className='text-sm font-medium'>
          {jornada.diaSemana} {formatearDiaCorto(jornada.dia)}
        </p>
        <p className='text-base'>
          <span className='font-semibold'>{jornada.local}</span>
          {' vs '}
          <span className='font-semibold'>{jornada.visitante}</span>
        </p>
        {jornada.localidadLocal && (
          <p className='text-sm text-muted-foreground'>
            {jornada.localidadLocal}
          </p>
        )}
      </div>

      <div className='flex w-full flex-col gap-3 lg:max-w-md'>
        {arbitros.map((arbitro) => (
          <div
            key={`${jornada.id}-${arbitro.id}`}
            className={cn(
              'rounded-lg border border-border bg-muted/20 p-3',
              arbitro.whatsappEnviado &&
                'border-emerald-500/40 bg-emerald-50/30'
            )}
          >
            <div className='mb-2 flex flex-wrap items-center gap-2'>
              <p className='text-sm font-semibold'>
                Árbitro {arbitro.orden}:{' '}
                {nombreCompletoArbitro(arbitro.nombre, arbitro.apellido)}
              </p>
              <Badge
                variant={arbitro.whatsappEnviado ? 'default' : 'secondary'}
                className={cn(
                  arbitro.whatsappEnviado &&
                    'border-emerald-600 bg-emerald-100 text-emerald-900'
                )}
              >
                {arbitro.whatsappEnviado ? 'WhatsApp enviado' : 'Sin WhatsApp'}
              </Badge>
            </div>
            <DetalleWhatsappHistorico whatsapp={arbitro.whatsapp} />
          </div>
        ))}
      </div>
    </div>
  )
}
