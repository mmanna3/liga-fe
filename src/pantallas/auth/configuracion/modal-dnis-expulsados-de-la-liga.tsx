import { api } from '@/api/api'
import { DniExpulsadoDeLaLigaDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Textarea } from '@/design-system/base-ui/textarea'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const QUERY_KEY = ['dniExpulsadoDeLaLiga'] as const

interface ModalDnisExpulsadosDeLaLigaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModalDnisExpulsadosDeLaLiga({
  open,
  onOpenChange
}: ModalDnisExpulsadosDeLaLigaProps) {
  const queryClient = useQueryClient()
  const [dniTexto, setDniTexto] = useState('')
  const [explicacionNueva, setExplicacionNueva] = useState('')

  const { data: lista = [], isPending } = useApiQuery<
    DniExpulsadoDeLaLigaDTO[]
  >({
    key: [...QUERY_KEY, open ? 'open' : 'closed'],
    fn: () => api.dniExpulsadoDeLaLigaAll(),
    activado: open
  })

  const invalidarLista = () => {
    void queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] })
  }

  const guardarMutation = useApiMutation({
    fn: (body: DniExpulsadoDeLaLigaDTO) => api.dniExpulsadoDeLaLigaPOST(body),
    mensajeDeExito: 'DNI registrado como expulsado.',
    antesDeMensajeExito: () => {
      invalidarLista()
      setDniTexto('')
      setExplicacionNueva('')
    }
  })

  const eliminarMutation = useApiMutation({
    fn: (id: number) => api.dniExpulsadoDeLaLigaDELETE(id),
    mensajeDeExito: 'DNI quitado de la lista.',
    antesDeMensajeExito: invalidarLista
  })

  useEffect(() => {
    if (open) {
      setDniTexto('')
      setExplicacionNueva('')
    }
  }, [open])

  const dniNumero = dniTexto.trim() === '' ? NaN : Number(dniTexto)
  const puedeGuardar =
    Number.isInteger(dniNumero) &&
    dniNumero > 0 &&
    explicacionNueva.trim().length > 0 &&
    !guardarMutation.isPending

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!puedeGuardar) return
    guardarMutation.mutate(
      new DniExpulsadoDeLaLigaDTO({
        dni: dniNumero,
        explicacion: explicacionNueva.trim()
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90vh,640px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden sm:max-w-xl'>
        <DialogHeader className='shrink-0 space-y-3 pr-8 text-left'>
          <DialogTitle className='flex items-center gap-2 text-lg font-semibold mb-6'>
            <Icono nombre='DNIsExpulsados' className='h-8 w-8 shrink-0' />
            DNIs expulsados de la liga
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleGuardar}
          className='flex shrink-0 flex-col gap-3 border-b pb-4'
        >
          <div className='grid gap-2'>
            <Label htmlFor='dni-expulsado-nuevo'>DNI</Label>
            <Input
              id='dni-expulsado-nuevo'
              className='w-40'
              type='number'
              inputMode='numeric'
              min={1}
              step={1}
              placeholder='Número de documento'
              value={dniTexto}
              onChange={(e) => setDniTexto(e.target.value)}
              autoComplete='off'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='explicacion-expulsado-nuevo'>Explicación</Label>
            <Textarea
              id='explicacion-expulsado-nuevo'
              placeholder='Motivo de la expulsión'
              rows={3}
              value={explicacionNueva}
              onChange={(e) => setExplicacionNueva(e.target.value)}
            />
          </div>
          <Boton
            type='submit'
            className='w-fit'
            disabled={!puedeGuardar}
            estaCargando={guardarMutation.isPending}
          >
            Expulsar de la liga
          </Boton>
        </form>

        <div className='min-h-0 flex-1 overflow-y-auto pt-4'>
          {isPending ? (
            <div className='flex justify-center py-8'>
              <Icono
                nombre='Cargando'
                className='size-8 shrink-0 animate-spin text-muted-foreground'
              />
            </div>
          ) : lista.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No hay DNIs expulsados cargados.
            </p>
          ) : (
            <>
              <p className='mb-3 text-sm text-muted-foreground'>
                Estos DNIs no podrán ficharse en la liga ni como jugadores ni
                como delegados
              </p>
              <ul className='flex flex-col gap-2'>
                {lista.map((item) => (
                  <li
                    key={item.id ?? `${item.dni}-${item.explicacion}`}
                    className='flex items-start gap-2 rounded-md border bg-muted/30 px-3 py-2'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium tabular-nums'>
                        {item.dni != null ? item.dni : '—'}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {item.explicacion}
                      </p>
                    </div>
                    {item.id != null && (
                      <Boton
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='shrink-0 text-muted-foreground hover:text-destructive'
                        title='Quitar de la lista'
                        disabled={eliminarMutation.isPending}
                        onClick={() => eliminarMutation.mutate(item.id!)}
                      >
                        <Icono nombre='Eliminar' className='size-4' />
                        <span className='sr-only'>Eliminar</span>
                      </Boton>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
