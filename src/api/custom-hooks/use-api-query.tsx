import { useQuery } from '@tanstack/react-query'

interface IProps<T> {
  fn: () => Promise<T>
  key: Array<string | number | null | undefined>
  activado?: boolean
  onResultadoExitoso?: (data: T) => void
  onError?: (error: unknown) => void
}

const useApiQuery = <T,>(props: IProps<T>) => {
  const query = useQuery<T, Error>({
    enabled: props.activado,
    queryKey: props.key,
    throwOnError: true,
    queryFn: async () => {
      // try {
      return await props.fn()
      // } catch (error) {
      //   console.log('Error en Request', error)
      //   throw new Error('Error en el servidor: ' + error)
      // }
    },
    onSuccess: props.onResultadoExitoso,
    onError: props.onError
  })

  return query
}

export default useApiQuery
