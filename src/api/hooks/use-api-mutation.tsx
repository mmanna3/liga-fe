import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface IProps<T> {
  fn: (args: T) => Promise<unknown>
  mensajeDeExito?: string
  antesDeMensajeExito?: () => void
  mensajeDeError?: string
}

const useApiMutation = <T,>({
  fn,
  mensajeDeExito = 'Operación exitosa',
  antesDeMensajeExito = () => {},
  mensajeDeError = 'Ocurrió un error inesperado'
}: IProps<T>) => {
  const mutation = useMutation({
    mutationFn: async (args: T) => {
      return fn(args)
    },
    onError: (error: unknown) => {
      console.error('Error en la mutación:', error)

      const mensaje =
        error instanceof Error
          ? JSON.parse((error as unknown as { response: string }).response)
              .title
          : mensajeDeError
      console.log()

      toast.error(mensaje)
    },
    onSuccess: () => {
      antesDeMensajeExito()
      toast.success(mensajeDeExito)
    }
  })

  return mutation
}

export default useApiMutation
