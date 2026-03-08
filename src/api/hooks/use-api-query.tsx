import { useQuery, UseQueryOptions } from '@tanstack/react-query'

interface IProps<TData, TTransformed = TData> {
  fn: () => Promise<TData>
  key: Array<string | number | null | undefined>
  activado?: boolean
  transformarResultado?: (data: TData) => TTransformed
  onError?: (error: unknown) => void
  refetchInterval?: number
}

const useApiQuery = <TData, TTransformed = TData>(
  props: IProps<TData, TTransformed>
) => {
  return useQuery<TData, Error, TTransformed>({
    enabled: props.activado,
    queryKey: props.key,
    throwOnError: true,
    queryFn: async () => await props.fn(),
    select: props.transformarResultado,
    refetchInterval: props.refetchInterval
  } as UseQueryOptions<TData, Error, TTransformed>)
}

export default useApiQuery
