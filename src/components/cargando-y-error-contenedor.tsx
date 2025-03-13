import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Skeleton } from './ui/skeleton'

type IProps = {
  estaCargando: boolean
  hayError: boolean
  mensajeDeError?: string
  children: React.ReactNode
}

export function ContenedorCargandoYError({
  estaCargando,
  hayError,
  mensajeDeError,
  children
}: IProps) {
  if (hayError) {
    return (
      <Alert variant='destructive' className='mb-4 max-w-md mx-auto'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          {mensajeDeError || 'No se pudieron recuperar los datos.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (estaCargando) {
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-16 w-64' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
      </div>
    )
  }

  return <>{children}</>
}
