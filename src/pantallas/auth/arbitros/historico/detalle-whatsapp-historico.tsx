import type { WhatsappAsignacionDTO } from '@/api/clients'
import { formatearDetalleWhatsappHistorico } from '../asignacion/utilidades-asignacion'

interface DetalleWhatsappHistoricoProps {
  whatsapp?: WhatsappAsignacionDTO | null
}

export default function DetalleWhatsappHistorico({
  whatsapp
}: DetalleWhatsappHistoricoProps) {
  const lineas = formatearDetalleWhatsappHistorico(whatsapp)

  if (!whatsapp?.enviado) {
    return (
      <p className='text-sm text-muted-foreground'>Sin WhatsApp registrado</p>
    )
  }

  if (lineas.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        WhatsApp enviado (sin detalle adicional)
      </p>
    )
  }

  return (
    <div className='space-y-1 text-sm text-muted-foreground'>
      {lineas.map((linea) => (
        <p key={linea}>{linea}</p>
      ))}
    </div>
  )
}
