import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { parsearErrorApi } from '@/lib/parsear-error-api'

interface IProps<T> {
  fn: (args: T) => Promise<unknown>
  mensajeDeExito?: string
  antesDeMensajeExito?: () => void
  mensajeDeError?: string
}

const useApiMutation = <T,>({
  fn,
  mensajeDeExito = 'Operacion exitosa',
  antesDeMensajeExito = () => {},
  mensajeDeError = 'Ocurrio un error inesperado'
}: IProps<T>) => {
  const mutation = useMutation({
    mutationFn: async (args: T) => {
      return fn(args)
    },
    onError: (error: unknown) => {
      const mensaje = parsearErrorApi(error, mensajeDeError)
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
