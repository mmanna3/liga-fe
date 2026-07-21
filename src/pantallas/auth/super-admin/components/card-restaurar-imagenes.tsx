import { api } from '@/api/api'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useMutation } from '@tanstack/react-query'
import { parsearErrores } from '../parsear-errores'
import MensajeResultadoAccion from './mensaje-resultado-accion'

export default function CardRestaurarImagenes() {
  const { mutate, isPending, isSuccess, isError, error, reset } = useMutation({
    mutationFn: () => api.restaurarImagenesDesdeBackup()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Icono nombre='Subir' className='h-8 w-8' />
          Restaurar imágenes desde backup
        </CardTitle>
        <CardDescription>
          Restaura las imágenes (escudos de clubes, fotos de jugadores, etc.)
          desde el backup configurado en el servidor.
        </CardDescription>
      </CardHeader>

      <div className='px-6 pb-6 flex flex-col gap-4'>
        <Boton
          onClick={() => {
            reset()
            mutate()
          }}
          disabled={isPending}
          variant='outline'
        >
          {isPending ? (
            <span className='flex items-center gap-2'>
              <Icono nombre='Cargando' className='h-4 w-4 animate-spin' />
              Restaurando imágenes...
            </span>
          ) : (
            'Restaurar imágenes'
          )}
        </Boton>

        <MensajeResultadoAccion
          exito={isSuccess}
          mensajeExito='Imágenes restauradas correctamente.'
          error={isError}
          tituloError='Error al restaurar las imágenes:'
          errores={parsearErrores(error)}
          errorObj={error}
        />
      </div>
    </Card>
  )
}
