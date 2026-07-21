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

export default function CardRestaurarBd() {
  const { mutate, isPending, isSuccess, isError, error, reset } = useMutation({
    mutationFn: () => api.restaurarBdDesdeBackup()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Icono nombre='BaseDeDatos' className='h-8 w-8' />
          Restaurar base de datos
        </CardTitle>
        <CardDescription>
          A partir del archivo backup-bd.json que tiene que estar en la carpeta
          App_Data del servidor.
        </CardDescription>
      </CardHeader>

      <div className='px-6 pb-6 flex flex-col gap-4'>
        <Boton
          onClick={() => {
            reset()
            mutate()
          }}
          disabled={isPending}
          variant='destructive'
        >
          {isPending ? (
            <span className='flex items-center gap-2'>
              <Icono nombre='Cargando' className='h-4 w-4 animate-spin' />
              Restaurando base de datos...
            </span>
          ) : (
            'Restaurar'
          )}
        </Boton>

        <MensajeResultadoAccion
          exito={isSuccess}
          mensajeExito='Base de datos restaurada correctamente.'
          error={isError}
          tituloError='Error al restaurar la base de datos:'
          errores={parsearErrores(error)}
          errorObj={error}
        />
      </div>
    </Card>
  )
}
