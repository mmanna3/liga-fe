import type {
  ArbitroElegibleAsignacionDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { cn } from '@/logica-compartida/utils'
import {
  construirMensajeWhatsappArbitro,
  construirUrlWhatsapp
} from './utilidades-asignacion'

function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      className={cn('h-5 w-5', className)}
      aria-hidden
    >
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  )
}

interface BotonWhatsappArbitroProps {
  jornada: JornadaAsignacionDTO
  arbitroId: string
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  whatsappEnviado: boolean
  deshabilitado?: boolean
  alMarcarEnviado: () => void
}

export default function BotonWhatsappArbitro({
  jornada,
  arbitroId,
  arbitrosElegibles,
  whatsappEnviado,
  deshabilitado,
  alMarcarEnviado
}: BotonWhatsappArbitroProps) {
  if (arbitroId === 'sin-arbitro') {
    return (
      <div className='mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center' />
    )
  }

  const arbitro = arbitrosElegibles.find((a) => String(a.id) === arbitroId)
  if (!arbitro) return null

  const telefono =
    jornada.arbitrosAsignados?.find((a) => a.id === Number(arbitroId))
      ?.telefonoCelular ?? arbitro.telefonoCelular

  const mensaje = construirMensajeWhatsappArbitro({
    nombre: arbitro.nombre ?? '',
    apellido: arbitro.apellido ?? '',
    local: jornada.local ?? '',
    visitante: jornada.visitante ?? '',
    torneoNombre: jornada.torneoNombre ?? '',
    faseNombre: jornada.faseNombre ?? '',
    zonaNombre: jornada.zonaNombre ?? '',
    dia: jornada.dia,
    diaSemana: jornada.diaSemana ?? '',
    nombreClubLocal: jornada.nombreClubLocal ?? jornada.local ?? '',
    direccionLocal: jornada.direccionLocal,
    localidadLocal: jornada.localidadLocal
  })

  const url = telefono ? construirUrlWhatsapp(telefono, mensaje) : ''
  const sinTelefono = !url

  const boton = (
    <Button
      type='button'
      variant='outline'
      size='icon'
      className={cn(
        'mb-0.5 shrink-0',
        whatsappEnviado
          ? 'border-muted-foreground/30 text-muted-foreground'
          : 'border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#128C7E]'
      )}
      disabled={deshabilitado || sinTelefono}
      onClick={() => {
        if (!url) return
        window.open(url, '_blank', 'noopener,noreferrer')
        alMarcarEnviado()
      }}
      aria-label={
        whatsappEnviado
          ? 'WhatsApp enviado'
          : 'Enviar mensaje por WhatsApp al árbitro'
      }
    >
      <IconoWhatsapp />
    </Button>
  )

  if (sinTelefono) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{boton}</span>
          </TooltipTrigger>
          <TooltipContent>
            El árbitro no tiene teléfono celular cargado
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return boton
}
