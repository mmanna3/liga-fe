import type {
  ArbitroElegibleAsignacionDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { cn } from '@/logica-compartida/utils'
import { Check } from 'lucide-react'
import BotonWhatsappArbitro from './boton-whatsapp-arbitro'
import {
  claveWhatsappJornadaArbitro,
  formatearDiaCorto,
  jornadaTieneAsignacion
} from './utilidades-asignacion'
import SelectorArbitroJornada from './selector-arbitro-jornada'

interface FilaJornadaAsignacionProps {
  jornada: JornadaAsignacionDTO
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  arbitro1Id: string
  arbitro2Id: string
  whatsappEnviadoPorAsignacion: Record<string, boolean>
  guardando: boolean
  alCambiarArbitro1: (arbitroId: string) => void
  alCambiarArbitro2: (arbitroId: string) => void
  alMarcarWhatsappEnviado: (jornadaId: number, arbitroId: number) => void
}

function SlotArbitroConWhatsapp({
  titulo,
  jornada,
  arbitrosElegibles,
  arbitroId,
  otroSlotArbitroId,
  whatsappEnviado,
  guardando,
  alCambiar,
  alMarcarWhatsappEnviado
}: {
  titulo: string
  jornada: JornadaAsignacionDTO
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  arbitroId: string
  otroSlotArbitroId: string
  whatsappEnviado: boolean
  guardando: boolean
  alCambiar: (arbitroId: string) => void
  alMarcarWhatsappEnviado: (jornadaId: number, arbitroId: number) => void
}) {
  return (
    <div className='flex min-w-[200px] flex-1 items-end gap-2'>
      <div className='min-w-0 flex-1'>
        <SelectorArbitroJornada
          titulo={titulo}
          jornada={jornada}
          arbitrosElegibles={arbitrosElegibles}
          valor={arbitroId}
          otroSlotArbitroId={otroSlotArbitroId}
          deshabilitado={guardando}
          alCambiar={alCambiar}
        />
      </div>
      <BotonWhatsappArbitro
        jornada={jornada}
        arbitroId={arbitroId}
        arbitrosElegibles={arbitrosElegibles}
        whatsappEnviado={whatsappEnviado}
        deshabilitado={guardando}
        alMarcarEnviado={() => {
          if (arbitroId === 'sin-arbitro') return
          alMarcarWhatsappEnviado(jornada.id, Number(arbitroId))
        }}
      />
    </div>
  )
}

export default function FilaJornadaAsignacion({
  jornada,
  arbitrosElegibles,
  arbitro1Id,
  arbitro2Id,
  whatsappEnviadoPorAsignacion,
  guardando,
  alCambiarArbitro1,
  alCambiarArbitro2,
  alMarcarWhatsappEnviado
}: FilaJornadaAsignacionProps) {
  const tieneAsignacion = jornadaTieneAsignacion(arbitro1Id, arbitro2Id)

  const whatsappEnviado1 =
    arbitro1Id !== 'sin-arbitro'
      ? (whatsappEnviadoPorAsignacion[
          claveWhatsappJornadaArbitro(jornada.id, Number(arbitro1Id))
        ] ?? false)
      : false

  const whatsappEnviado2 =
    arbitro2Id !== 'sin-arbitro'
      ? (whatsappEnviadoPorAsignacion[
          claveWhatsappJornadaArbitro(jornada.id, Number(arbitro2Id))
        ] ?? false)
      : false

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-border py-4 pl-3 last:border-b-0 lg:flex-row lg:items-end lg:justify-between',
        tieneAsignacion && 'border-l-4 border-emerald-500 bg-emerald-50/40'
      )}
    >
      <div
        className={cn(
          'min-w-0 flex-1 space-y-1',
          tieneAsignacion && 'text-emerald-800'
        )}
      >
        <p className='flex items-center gap-1.5 text-sm font-medium'>
          {tieneAsignacion && (
            <Check className='h-4 w-4 shrink-0 text-emerald-600' aria-hidden />
          )}
          {jornada.diaSemana} {formatearDiaCorto(jornada.dia)}
        </p>
        <p className='text-base'>
          <span className='font-semibold'>{jornada.local}</span>
          {' vs '}
          <span className='font-semibold'>{jornada.visitante}</span>
        </p>
        {jornada.localidadLocal && (
          <p
            className={cn(
              'text-sm',
              tieneAsignacion ? 'text-emerald-700' : 'text-muted-foreground'
            )}
          >
            {jornada.localidadLocal}
          </p>
        )}
      </div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
        <SlotArbitroConWhatsapp
          titulo='Árbitro 1'
          jornada={jornada}
          arbitrosElegibles={arbitrosElegibles}
          arbitroId={arbitro1Id}
          otroSlotArbitroId={arbitro2Id}
          whatsappEnviado={whatsappEnviado1}
          guardando={guardando}
          alCambiar={alCambiarArbitro1}
          alMarcarWhatsappEnviado={alMarcarWhatsappEnviado}
        />
        <SlotArbitroConWhatsapp
          titulo='Árbitro 2'
          jornada={jornada}
          arbitrosElegibles={arbitrosElegibles}
          arbitroId={arbitro2Id}
          otroSlotArbitroId={arbitro1Id}
          whatsappEnviado={whatsappEnviado2}
          guardando={guardando}
          alCambiar={alCambiarArbitro2}
          alMarcarWhatsappEnviado={alMarcarWhatsappEnviado}
        />
      </div>
    </div>
  )
}
