import { type FaseDTO, type ZonaDeFaseDTO } from '@/api/clients'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { MessageSquareMore } from 'lucide-react'
import { useMemo, useState } from 'react'
import { zonasDeFaseOrdenadas } from '../crear-torneo/components/datos-fase-lectura'
import ModalZonaLeyendas from '../crear-torneo/components/modal-zona-leyendas'

/**
 * Zonas de la tabla Anual: las de Apertura que tienen una zona con el mismo nombre en Clausura (igual que el back,
 * que solo arma la tabla Anual para esas zonas). Las leyendas anuales se guardan en la zona de Apertura.
 */
export function zonasDeTablaAnual(
  faseApertura: FaseDTO | undefined,
  faseClausura: FaseDTO | undefined
): ZonaDeFaseDTO[] {
  const nombresClausura = new Set(
    (faseClausura?.zonas ?? []).map((z) => (z.nombre ?? '').trim())
  )
  return zonasDeFaseOrdenadas(
    (faseApertura?.zonas ?? []).filter(
      (z) => z.id != null && nombresClausura.has((z.nombre ?? '').trim())
    )
  )
}

export interface ModalLeyendasTablaAnualProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nombreTorneo: string
  fases: FaseDTO[]
  faseAperturaId?: number
  faseClausuraId?: number
}

export default function ModalLeyendasTablaAnual({
  open,
  onOpenChange,
  nombreTorneo,
  fases,
  faseAperturaId,
  faseClausuraId
}: ModalLeyendasTablaAnualProps) {
  const [zonaSeleccionada, setZonaSeleccionada] =
    useState<ZonaDeFaseDTO | null>(null)

  const faseApertura = fases.find((f) => f.id === faseAperturaId)
  const faseClausura = fases.find((f) => f.id === faseClausuraId)

  const zonas = useMemo(
    () => zonasDeTablaAnual(faseApertura, faseClausura),
    [faseApertura, faseClausura]
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader className='text-left'>
            <DialogTitle className='flex items-center gap-2'>
              <MessageSquareMore className='h-5 w-5 shrink-0' aria-hidden />
              Leyendas de la tabla Anual
            </DialogTitle>
            <DialogDescription>
              Estas leyendas solo se muestran en la tabla Anual. Las leyendas de
              Apertura y Clausura no aparecen en ella.
            </DialogDescription>
          </DialogHeader>
          {zonas.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No hay zonas con el mismo nombre en Apertura y Clausura.
            </p>
          ) : (
            <ul className='grid grid-cols-2 gap-1.5'>
              {zonas.map((zona) => (
                <li key={zona.id}>
                  <button
                    type='button'
                    className='flex w-full items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted/50'
                    aria-label={`Leyendas de la tabla Anual de ${zona.nombre}`}
                    onClick={() => setZonaSeleccionada(zona)}
                  >
                    <span className='min-w-0 flex-1 truncate'>
                      {zona.nombre}
                    </span>
                    <MessageSquareMore
                      className='h-4 w-4 shrink-0'
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
      {zonaSeleccionada?.id != null && faseAperturaId != null && (
        <ModalZonaLeyendas
          open
          onOpenChange={(abierto) => {
            if (!abierto) setZonaSeleccionada(null)
          }}
          faseId={faseAperturaId}
          zonaId={zonaSeleccionada.id}
          nombreTorneo={nombreTorneo}
          nombreFase='Anual'
          tipoDeFase='—'
          nombreZona={zonaSeleccionada.nombre ?? '—'}
          categorias={faseApertura?.categorias ?? []}
          esDeTablaAnual
        />
      )}
    </>
  )
}
