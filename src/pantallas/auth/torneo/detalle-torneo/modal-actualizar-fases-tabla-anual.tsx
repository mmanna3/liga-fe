import {
  EditarFasesParaTablaAnualDTO,
  FaseDTO,
  TipoDeFaseEnum
} from '@/api/clients'
import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import {
  ListaDesplegable,
  OpcionDesplegable
} from '@/design-system/ykn-ui/lista-desplegable'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useEffect, useMemo, useState } from 'react'

function fasesTodosContraTodos(fases: FaseDTO[]): FaseDTO[] {
  return (fases ?? []).filter(
    (f) => f.tipoDeFase === TipoDeFaseEnum._1 && f.id != null
  )
}

function opcionesConHuerfanas(
  fasesTct: FaseDTO[],
  idSeleccionado: number | undefined,
  nombreHuerfano: string | undefined
): OpcionDesplegable[] {
  const ids = new Set(
    fasesTct.map((f) => f.id).filter((x): x is number => x != null)
  )
  const base: OpcionDesplegable[] = fasesTct.map((f) => ({
    value: String(f.id),
    label: f.nombre
  }))
  if (
    idSeleccionado != null &&
    !ids.has(idSeleccionado) &&
    idSeleccionado > 0
  ) {
    base.push({
      value: String(idSeleccionado),
      label: nombreHuerfano ?? 'Fase (no disponible en el torneo)'
    })
  }
  return base
}

const TEXTO_EXPLICATIVO =
  'Al seleccionar estas fases, aparecerá en la app y en la web una nueva fase de nombre "Anual", listando todas las zonas de la fase seleccionada como "Apertura" y todas las zonas de la seleccionada como "Clausura". Las zonas que tengan el mismo nombre se unirán en una única tabla anual en la que se sumarán todas las columnas de todos los equipos de la zona'

export interface ModalActualizarFasesTablaAnualProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  torneoId: number
  nombreTorneo: string
  agrupadorNombre: string | undefined
  fases: FaseDTO[]
  faseAperturaId?: number
  faseAperturaNombre?: string
  faseClausuraId?: number
  faseClausuraNombre?: string
  alGuardarExito: () => void
}

export default function ModalActualizarFasesTablaAnual({
  open,
  onOpenChange,
  torneoId,
  nombreTorneo,
  agrupadorNombre,
  fases,
  faseAperturaId,
  faseAperturaNombre,
  faseClausuraId,
  faseClausuraNombre,
  alGuardarExito
}: ModalActualizarFasesTablaAnualProps) {
  const fasesTct = useMemo(() => fasesTodosContraTodos(fases), [fases])

  const opcionesApertura = useMemo(
    () => opcionesConHuerfanas(fasesTct, faseAperturaId, faseAperturaNombre),
    [fasesTct, faseAperturaId, faseAperturaNombre]
  )

  const opcionesClausura = useMemo(
    () => opcionesConHuerfanas(fasesTct, faseClausuraId, faseClausuraNombre),
    [fasesTct, faseClausuraId, faseClausuraNombre]
  )

  const [apertura, setApertura] = useState('')
  const [clausura, setClausura] = useState('')

  useEffect(() => {
    if (!open) return
    setApertura(
      faseAperturaId != null && faseAperturaId > 0 ? String(faseAperturaId) : ''
    )
    setClausura(
      faseClausuraId != null && faseClausuraId > 0 ? String(faseClausuraId) : ''
    )
  }, [open, faseAperturaId, faseClausuraId])

  const guardarMutation = useApiMutation({
    fn: (body: EditarFasesParaTablaAnualDTO) =>
      api.torneoEditarFasesParaTablaAnual(torneoId, body),
    mensajeDeExito: 'Fases para tabla anual actualizadas.',
    antesDeMensajeExito: () => {
      alGuardarExito()
      onOpenChange(false)
    }
  })

  const puedeGuardar =
    apertura !== '' && clausura !== '' && !guardarMutation.isPending

  const hayAlgoParaElegir =
    fasesTct.length > 0 ||
    (faseAperturaId != null && faseAperturaId > 0) ||
    (faseClausuraId != null && faseClausuraId > 0)

  const handleGuardar = () => {
    if (!puedeGuardar) return
    guardarMutation.mutate(
      new EditarFasesParaTablaAnualDTO({
        faseAperturaId: Number(apertura),
        faseClausuraId: Number(clausura)
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-y-auto sm:max-w-xl'>
        <DialogHeader className='shrink-0 space-y-2 pr-8 text-left'>
          <DialogTitle className='text-lg font-semibold'>
            {nombreTorneo}
          </DialogTitle>
          <DialogDescription>
            {agrupadorNombre?.trim() ? agrupadorNombre : '—'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2 text-sm text-muted-foreground'>
          <p className='text-foreground/90 leading-relaxed'>
            {TEXTO_EXPLICATIVO}
          </p>
        </div>

        {!hayAlgoParaElegir ? (
          <p className='text-sm text-destructive'>
            Este torneo no tiene fases &quot;Todos contra todos&quot; para
            seleccionar.
          </p>
        ) : (
          <div className='space-y-4'>
            <ListaDesplegable
              titulo='Fase Apertura'
              opciones={opcionesApertura}
              valor={apertura}
              alCambiar={setApertura}
              placeholder='Elegí una fase'
              id='fase-apertura-tabla-anual'
            />
            <ListaDesplegable
              titulo='Fase Clausura'
              opciones={opcionesClausura}
              valor={clausura}
              alCambiar={setClausura}
              placeholder='Elegí una fase'
              id='fase-clausura-tabla-anual'
            />
          </div>
        )}

        <DialogFooter className='gap-2 pt-4'>
          <Boton
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={guardarMutation.isPending}
          >
            Cancelar
          </Boton>
          <Boton
            type='button'
            onClick={handleGuardar}
            disabled={!puedeGuardar}
            estaCargando={guardarMutation.isPending}
          >
            Guardar
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
