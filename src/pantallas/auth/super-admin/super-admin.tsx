import { api } from '@/api/api'
import { ApiException } from '@/api/clients'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useMutation } from '@tanstack/react-query'

export default function SuperAdmin() {
  const {
    mutate: restaurarBd,
    isPending: bdPending,
    isSuccess: bdSuccess,
    isError: bdError,
    error: bdErrorObj,
    reset: resetBd
  } = useMutation({
    mutationFn: () => api.restaurarBdDesdeBackup()
  })

  const {
    mutate: restaurarImagenes,
    isPending: imagenesPending,
    isSuccess: imagenesSuccess,
    isError: imagenesError,
    error: imagenesErrorObj,
    reset: resetImagenes
  } = useMutation({
    mutationFn: () => api.restaurarImagenesDesdeBackup()
  })

  const erroresBd = parsearErrores(bdErrorObj)
  const erroresImagenes = parsearErrores(imagenesErrorObj)

  return (
    <FlujoHomeLayout
      titulo='SuperAdmin'
      iconoTitulo='SuperAdmin'
      ocultarBotonVolver
      contenidoEnCard={false}
      contenido={
        <div className='grid grid-cols-2 gap-4 py-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icono nombre='BaseDeDatos' className='h-8 w-8' />
                Restaurar base de datos
              </CardTitle>
              <CardDescription>
                A partir del archivo backup-bd.json que tiene que estar en la
                carpeta App_Data del servidor.
              </CardDescription>
            </CardHeader>

            <div className='px-6 pb-6 flex flex-col gap-4'>
              <Boton
                onClick={() => {
                  resetBd()
                  restaurarBd()
                }}
                disabled={bdPending}
                variant='destructive'
              >
                {bdPending ? (
                  <span className='flex items-center gap-2'>
                    <Icono nombre='Cargando' className='h-4 w-4 animate-spin' />
                    Restaurando base de datos...
                  </span>
                ) : (
                  'Restaurar'
                )}
              </Boton>

              {bdSuccess && (
                <p className='text-sm text-green-700 font-medium'>
                  Base de datos restaurada correctamente.
                </p>
              )}

              {bdError && (
                <div className='text-sm text-destructive space-y-1'>
                  <p className='font-medium'>
                    Error al restaurar la base de datos:
                  </p>
                  {erroresBd.length > 0 ? (
                    <ul className='list-disc list-inside space-y-0.5'>
                      {erroresBd.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {bdErrorObj instanceof Error
                        ? bdErrorObj.message
                        : 'Error desconocido'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Icono nombre='Subir' className='h-8 w-8' />
                Restaurar imágenes desde backup
              </CardTitle>
              <CardDescription>
                Restaura las imágenes (escudos de clubes, fotos de jugadores,
                etc.) desde el backup configurado en el servidor.
              </CardDescription>
            </CardHeader>

            <div className='px-6 pb-6 flex flex-col gap-4'>
              <Boton
                onClick={() => {
                  resetImagenes()
                  restaurarImagenes()
                }}
                disabled={imagenesPending}
                variant='outline'
              >
                {imagenesPending ? (
                  <span className='flex items-center gap-2'>
                    <Icono nombre='Cargando' className='h-4 w-4 animate-spin' />
                    Restaurando imágenes...
                  </span>
                ) : (
                  'Restaurar imágenes'
                )}
              </Boton>

              {imagenesSuccess && (
                <p className='text-sm text-green-700 font-medium'>
                  Imágenes restauradas correctamente.
                </p>
              )}

              {imagenesError && (
                <div className='text-sm text-destructive space-y-1'>
                  <p className='font-medium'>
                    Error al restaurar las imágenes:
                  </p>
                  {erroresImagenes.length > 0 ? (
                    <ul className='list-disc list-inside space-y-0.5'>
                      {erroresImagenes.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {imagenesErrorObj instanceof Error
                        ? imagenesErrorObj.message
                        : 'Error desconocido'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      }
    />
  )
}

function parsearErrores(error: unknown): string[] {
  if (!error) return []

  if (ApiException.isApiException(error)) {
    try {
      const parsed = JSON.parse(error.response)
      if (parsed?.errors) {
        return Object.values(parsed.errors).flat() as string[]
      }
      if (parsed?.title) return [parsed.title]
    } catch {
      if (error.response) return [error.response]
    }
  }

  return []
}
