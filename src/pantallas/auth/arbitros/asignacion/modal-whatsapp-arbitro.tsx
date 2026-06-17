import type {
  ArbitroElegibleAsignacionDTO,
  FaseCategoriaDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { Checkbox } from '@/design-system/base-ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Label } from '@/design-system/base-ui/label'
import { Textarea } from '@/design-system/base-ui/textarea'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import { cn } from '@/logica-compartida/utils'
import { useEffect, useMemo, useState } from 'react'
import { IconoWhatsapp } from './icono-whatsapp'
import {
  claveCategoriaFase,
  construirMensajeWhatsappArbitro,
  construirUrlWhatsapp,
  etiquetaCategoriaFase,
  horarioParaInput
} from './utilidades-asignacion'

interface ModalWhatsappArbitroProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jornada: JornadaAsignacionDTO
  arbitro: ArbitroElegibleAsignacionDTO
  telefono?: string | null
  categoriasFase: FaseCategoriaDTO[]
  horarioDeJuegoDefault?: string | null
  alEnviar: () => void
}

function categoriasOrdenadas(
  categorias: FaseCategoriaDTO[]
): FaseCategoriaDTO[] {
  return [...categorias].sort(
    (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)
  )
}

export default function ModalWhatsappArbitro({
  open,
  onOpenChange,
  jornada,
  arbitro,
  telefono,
  categoriasFase,
  horarioDeJuegoDefault,
  alEnviar
}: ModalWhatsappArbitroProps) {
  const categorias = useMemo(
    () => categoriasOrdenadas(categoriasFase),
    [categoriasFase]
  )
  const [horarioInicio, setHorarioInicio] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    Set<string>
  >(new Set())

  useEffect(() => {
    if (!open) return
    setHorarioInicio(horarioParaInput(horarioDeJuegoDefault))
    setObservaciones('')
    setCategoriasSeleccionadas(
      new Set(categorias.map((categoria) => claveCategoriaFase(categoria)))
    )
  }, [open, horarioDeJuegoDefault, categorias])

  const nombresCategoriasSeleccionadas = categorias
    .filter((categoria) =>
      categoriasSeleccionadas.has(claveCategoriaFase(categoria))
    )
    .map(etiquetaCategoriaFase)

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
    localidadLocal: jornada.localidadLocal,
    horarioInicio,
    categoriasSeleccionadas: nombresCategoriasSeleccionadas,
    observaciones
  })

  const url = telefono ? construirUrlWhatsapp(telefono, mensaje) : ''
  const requiereCategoria = categorias.length > 0
  const puedeEnviar =
    Boolean(url) && (!requiereCategoria || categoriasSeleccionadas.size > 0)

  const alternarCategoria = (clave: string, seleccionada: boolean) => {
    setCategoriasSeleccionadas((prev) => {
      const siguiente = new Set(prev)
      if (seleccionada) siguiente.add(clave)
      else siguiente.delete(clave)
      return siguiente
    })
  }

  const handleEnviar = () => {
    if (!url || !puedeEnviar) return
    window.open(url, '_blank', 'noopener,noreferrer')
    alEnviar()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <DialogHeader className='border-b border-border px-6 py-4'>
          <DialogTitle>Enviar WhatsApp al árbitro</DialogTitle>
        </DialogHeader>

        <div className='space-y-5 overflow-y-auto px-6 py-4'>
          {categorias.length > 0 && (
            <div className='space-y-3'>
              <p className='text-sm font-semibold'>Categorías de la fase</p>
              <div className='space-y-2'>
                {categorias.map((categoria) => {
                  const clave = claveCategoriaFase(categoria)
                  const id = `whatsapp-cat-${clave}`
                  return (
                    <div key={clave} className='flex items-center gap-2'>
                      <Checkbox
                        id={id}
                        checked={categoriasSeleccionadas.has(clave)}
                        onCheckedChange={(checked) =>
                          alternarCategoria(clave, checked === true)
                        }
                      />
                      <Label
                        htmlFor={id}
                        className='cursor-pointer font-normal'
                      >
                        {etiquetaCategoriaFase(categoria)}
                      </Label>
                    </div>
                  )
                })}
              </div>
              {requiereCategoria && categoriasSeleccionadas.size === 0 && (
                <p className='text-sm text-destructive'>
                  Seleccioná al menos una categoría.
                </p>
              )}
            </div>
          )}

          <Input
            id='whatsapp-horario-inicio'
            tipo='time'
            titulo='Horario de inicio de la jornada'
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
          />

          <div className='space-y-2'>
            <Label
              htmlFor='whatsapp-observaciones'
              className='text-md font-semibold'
            >
              Observaciones
            </Label>
            <Textarea
              id='whatsapp-observaciones'
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder='Opcional'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm font-semibold'>Mensaje</p>
            <div
              className={cn(
                'rounded-md border border-border bg-muted/40 px-3 py-2',
                'whitespace-pre-wrap text-sm text-muted-foreground'
              )}
            >
              {mensaje}
            </div>
          </div>
        </div>

        <div className='border-t border-border px-6 py-4'>
          <Boton
            type='button'
            className='w-full border-[#25D366]/40 bg-[#25D366] text-white hover:bg-[#128C7E]'
            disabled={!puedeEnviar}
            onClick={handleEnviar}
          >
            <IconoWhatsapp className='mr-2 h-5 w-5' />
            Enviar WhatsApp al árbitro
          </Boton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
