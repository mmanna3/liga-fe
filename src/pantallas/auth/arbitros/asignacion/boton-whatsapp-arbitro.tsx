import type {
  ArbitroElegibleAsignacionDTO,
  FaseCategoriaDTO,
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
import { useState } from 'react'
import { IconoWhatsapp } from './icono-whatsapp'
import ModalWhatsappArbitro from './modal-whatsapp-arbitro'
import { telefonoParaWaMe } from './utilidades-asignacion'

interface BotonWhatsappArbitroProps {
  jornada: JornadaAsignacionDTO
  arbitroId: string
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  categoriasFase: FaseCategoriaDTO[]
  horarioDeJuegoTorneo?: string | null
  whatsappEnviado: boolean
  deshabilitado?: boolean
  alMarcarEnviado: () => void
}

export default function BotonWhatsappArbitro({
  jornada,
  arbitroId,
  arbitrosElegibles,
  categoriasFase,
  horarioDeJuegoTorneo,
  whatsappEnviado,
  deshabilitado,
  alMarcarEnviado
}: BotonWhatsappArbitroProps) {
  const [modalAbierto, setModalAbierto] = useState(false)

  if (arbitroId === 'sin-arbitro') {
    return <div className='h-9 w-9 shrink-0' aria-hidden />
  }

  const arbitro = arbitrosElegibles.find((a) => String(a.id) === arbitroId)
  if (!arbitro) return null

  const telefono =
    jornada.arbitrosAsignados?.find((a) => a.id === Number(arbitroId))
      ?.telefonoCelular ?? arbitro.telefonoCelular

  const sinTelefono = !telefonoParaWaMe(telefono)

  const textoHint = sinTelefono
    ? 'El árbitro no tiene teléfono celular cargado'
    : whatsappEnviado
      ? 'Mensaje ya enviado'
      : 'Preparar mensaje de WhatsApp'

  const boton = (
    <Button
      type='button'
      variant='outline'
      size='icon'
      className={cn(
        'shrink-0',
        whatsappEnviado
          ? 'border-muted-foreground/30 text-muted-foreground'
          : 'border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#128C7E]'
      )}
      disabled={deshabilitado || sinTelefono}
      onClick={() => setModalAbierto(true)}
      aria-label={textoHint}
    >
      <IconoWhatsapp />
    </Button>
  )

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={sinTelefono ? 0 : undefined}>{boton}</span>
          </TooltipTrigger>
          <TooltipContent>{textoHint}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ModalWhatsappArbitro
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        jornada={jornada}
        arbitro={arbitro}
        telefono={telefono}
        categoriasFase={categoriasFase}
        horarioDeJuegoDefault={horarioDeJuegoTorneo}
        alEnviar={alMarcarEnviado}
      />
    </>
  )
}
