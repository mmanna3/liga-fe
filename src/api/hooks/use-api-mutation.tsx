import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

interface IProps<T> {
  fn: (args: T) => Promise<unknown>
  mensajeDeExito?: string
  antesDeMensajeExito?: () => void
  /** Se ejecuta después de mostrar el toast de éxito. */
  despuesDeMensajeExito?: () => void
  mensajeDeError?: string
}

const useApiMutation = <T,>({
  fn,
  mensajeDeExito = 'Operación exitosa',
  antesDeMensajeExito = () => {},
  despuesDeMensajeExito = () => {},
  mensajeDeError = 'Ocurrió un error inesperado'
}: IProps<T>) => {
  const mutation = useMutation({
    mutationFn: async (args: T) => {
      return fn(args)
    },
    onError: (error: unknown) => {
      console.error('Error en la mutación:', error)

      let mensaje = mensajeDeError
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: string }).response
        if (typeof response === 'string') {
          try {
            const parsed = JSON.parse(response)
            if (parsed?.title) mensaje = parsed.title
          } catch {
            // usar mensajeDeError
          }
        }
      } else if (error instanceof Error) {
        mensaje = error.message
      }

      toast.error(mensaje)
    },
    onSuccess: () => {
      antesDeMensajeExito()
      toast.success(mensajeDeExito)
      despuesDeMensajeExito()
    }
  })

  return mutation
}

export default useApiMutation
