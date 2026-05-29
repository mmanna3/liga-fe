import {
  sponsorWebPublicaAll,
  sponsorWebPublicaDELETE,
  sponsorWebPublicaPOST,
  type CrearSponsorWebPublicaDTO
} from '@/api/sponsor-web-publica-api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

const QUERY_KEY = ['sponsorWebPublica'] as const

const FORMATOS_ACEPTADOS =
  '.svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg'

export default function SponsorsWebPublica() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState('')
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [imagenDataUrl, setImagenDataUrl] = useState<string | null>(null)

  const { data: sponsors = [], isPending } = useApiQuery({
    key: [...QUERY_KEY],
    fn: () => sponsorWebPublicaAll()
  })

  const invalidarLista = () => {
    void queryClient.invalidateQueries({ queryKey: [...QUERY_KEY] })
  }

  const crearMutation = useApiMutation({
    fn: (body: CrearSponsorWebPublicaDTO) => sponsorWebPublicaPOST(body),
    mensajeDeExito: 'Sponsor cargado correctamente.',
    antesDeMensajeExito: () => {
      invalidarLista()
      setNombre('')
      setPreviewDataUrl(null)
      setImagenDataUrl(null)
    }
  })

  const eliminarMutation = useApiMutation({
    fn: (id: number) => sponsorWebPublicaDELETE(id),
    mensajeDeExito: 'Sponsor eliminado.',
    antesDeMensajeExito: invalidarLista
  })

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      const result = reader.result as string
      setPreviewDataUrl(result)
      setImagenDataUrl(result)
    })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const puedeGuardar =
    nombre.trim().length > 0 &&
    imagenDataUrl != null &&
    !crearMutation.isPending

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!puedeGuardar || !imagenDataUrl) return
    crearMutation.mutate({
      nombre: nombre.trim(),
      imagenBase64: imagenDataUrl
    })
  }

  return (
    <FlujoHomeLayout
      titulo='Sponsors web pública'
      iconoTitulo='SponsorsWeb'
      pathBotonVolver={rutasNavegacion.configuracion}
      contenidoEnCard={false}
      contenido={
        <div className='flex flex-col gap-8 py-6'>
          <form
            onSubmit={handleGuardar}
            className='flex flex-col gap-4 rounded-lg border bg-card p-6'
          >
            <div>
              <h2 className='text-lg font-semibold'>Cargar sponsor</h2>
              <p className='text-sm text-muted-foreground'>
                Los logos se muestran en el carrusel de la web pública. Para
                fondo transparente, subí PNG o SVG.
              </p>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='sponsor-nombre'>Nombre</Label>
              <Input
                id='sponsor-nombre'
                placeholder='Nombre del sponsor'
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete='off'
              />
            </div>

            <div className='grid gap-2'>
              <Label>Logo</Label>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
                <div className='flex h-32 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] bg-size-[12px_12px] bg-position-[0_0,6px_6px]'>
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt='Vista previa del logo'
                      className='max-h-full max-w-full object-contain'
                    />
                  ) : (
                    <span className='px-3 text-center text-xs text-muted-foreground'>
                      Sin imagen seleccionada
                    </span>
                  )}
                </div>
                <div className='flex flex-col gap-2'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept={FORMATOS_ACEPTADOS}
                    onChange={handleSelectFile}
                    className='hidden'
                  />
                  <Boton
                    type='button'
                    variant='outline'
                    size='sm'
                    className='gap-2 w-fit'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icono nombre='Subir' className='h-4 w-4' />
                    Elegir imagen
                  </Boton>
                  {imagenDataUrl && (
                    <Boton
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='w-fit'
                      onClick={() => {
                        setPreviewDataUrl(null)
                        setImagenDataUrl(null)
                      }}
                    >
                      Quitar imagen
                    </Boton>
                  )}
                </div>
              </div>
            </div>

            <Boton
              type='submit'
              className='w-fit'
              disabled={!puedeGuardar}
              estaCargando={crearMutation.isPending}
            >
              Cargar sponsor
            </Boton>
          </form>

          <div className='flex flex-col gap-4'>
            <div>
              <h2 className='text-lg font-semibold'>Sponsors actuales</h2>
              <p className='text-sm text-muted-foreground'>
                {sponsors.length === 0
                  ? 'Todavía no hay sponsors cargados.'
                  : `${sponsors.length} sponsor${sponsors.length === 1 ? '' : 's'} en la web pública.`}
              </p>
            </div>

            {isPending ? (
              <div className='flex justify-center py-8'>
                <Icono
                  nombre='Cargando'
                  className='size-8 shrink-0 animate-spin text-muted-foreground'
                />
              </div>
            ) : sponsors.length === 0 ? (
              <p className='text-sm text-muted-foreground italic'>
                Cargá el primer sponsor con el formulario de arriba.
              </p>
            ) : (
              <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {sponsors.map((sponsor) => (
                  <li
                    key={sponsor.id}
                    className='flex flex-col gap-3 rounded-lg border bg-card p-4'
                  >
                    <div className='flex h-24 items-center justify-center rounded-md bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] bg-size-[10px_10px] bg-position-[0_0,5px_5px] p-3'>
                      {sponsor.imagen ? (
                        <img
                          src={sponsor.imagen}
                          alt={sponsor.nombre}
                          className='max-h-full max-w-full object-contain'
                        />
                      ) : (
                        <span className='text-xs text-muted-foreground'>
                          Sin imagen
                        </span>
                      )}
                    </div>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='font-medium'>{sponsor.nombre}</p>
                      {sponsor.id != null && (
                        <Boton
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='shrink-0 text-muted-foreground hover:text-destructive'
                          title='Eliminar sponsor'
                          disabled={eliminarMutation.isPending}
                          onClick={() => eliminarMutation.mutate(sponsor.id!)}
                        >
                          <Icono nombre='Eliminar' className='size-4' />
                          <span className='sr-only'>Eliminar</span>
                        </Boton>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      }
    />
  )
}
