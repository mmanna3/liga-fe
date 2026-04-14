import { api } from '@/api/api'
import { CambiarEscudoPorDefectoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useEffect, useRef, useState } from 'react'

function extraerBase64(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    const base64Index = dataUrl.indexOf(',')
    return base64Index >= 0 ? dataUrl.slice(base64Index + 1) : dataUrl
  }
  return dataUrl
}

function urlEscudoPorDefecto(cacheBust: number): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  return `${base}/Imagenes/Escudos/_pordefecto.jpg?v=${cacheBust}`
}

interface ModalEscudoPorDefectoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModalEscudoPorDefecto({
  open,
  onOpenChange
}: ModalEscudoPorDefectoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cacheBust, setCacheBust] = useState(0)
  const [escudoBase64, setEscudoBase64] = useState<string | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [servidorSinImagen, setServidorSinImagen] = useState(false)

  useEffect(() => {
    if (open) {
      setEscudoBase64(null)
      setPreviewDataUrl(null)
      setServidorSinImagen(false)
      setCacheBust(Date.now())
    }
  }, [open])

  const guardarMutation = useApiMutation({
    fn: (dto: CambiarEscudoPorDefectoDTO) => api.cambiarEscudoPorDefecto(dto),
    mensajeDeExito: 'Escudo por defecto actualizado correctamente.',
    antesDeMensajeExito: () => {
      setEscudoBase64(null)
      setPreviewDataUrl(null)
      setCacheBust(Date.now())
    },
    despuesDeMensajeExito: () => onOpenChange(false)
  })

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const result = reader.result as string
        setPreviewDataUrl(result)
        setEscudoBase64(extraerBase64(result))
      })
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleGuardar = () => {
    if (!escudoBase64) return
    guardarMutation.mutate(
      new CambiarEscudoPorDefectoDTO({ escudo: escudoBase64 })
    )
  }

  const mostrarPlaceholder = !previewDataUrl && servidorSinImagen

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Cambiar escudo por defecto</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <p className='text-sm text-muted-foreground'>
            Elegí el escudo que se visualizará en Libre, Interzonal y equipos
            sin escudo.
          </p>
          <div className='space-y-2'>
            <Label>Vista previa</Label>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
              <div className='flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-muted'>
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt='Escudo por defecto (nuevo)'
                    className='h-full w-full object-contain'
                  />
                ) : mostrarPlaceholder ? (
                  <div className='flex flex-col items-center gap-1 px-2 text-center'>
                    <Icono
                      nombre='Equipos'
                      className='h-10 w-10 text-muted-foreground'
                    />
                    <span className='text-xs text-muted-foreground'>
                      Sin imagen en el servidor
                    </span>
                  </div>
                ) : (
                  <img
                    src={urlEscudoPorDefecto(cacheBust)}
                    alt='Escudo por defecto actual'
                    className='h-full w-full object-contain'
                    onError={() => setServidorSinImagen(true)}
                  />
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleSelectFile}
                  className='hidden'
                />
                <Boton
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icono nombre='Subir' className='h-4 w-4' />
                  Elegir imagen
                </Boton>
                {escudoBase64 && (
                  <Boton
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setEscudoBase64(null)
                      setPreviewDataUrl(null)
                      setServidorSinImagen(false)
                      setCacheBust(Date.now())
                    }}
                  >
                    Deshacer
                  </Boton>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Boton
            type='button'
            onClick={handleGuardar}
            disabled={!escudoBase64 || guardarMutation.isPending}
            estaCargando={guardarMutation.isPending}
          >
            Guardar
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
