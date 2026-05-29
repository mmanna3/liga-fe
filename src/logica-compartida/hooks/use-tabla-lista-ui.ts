import type { ListaUiState } from '@/logica-compartida/stores/create-lista-ui-store'
import type { OnChangeFn, PaginationState } from '@tanstack/react-table'
import type { StoreApi, UseBoundStore } from 'zustand'

type ListaUiStore<TFiltro extends number = number> = UseBoundStore<
  StoreApi<ListaUiState<TFiltro>>
>

/** Props de búsqueda y paginación controladas para `Tabla`, leídas de un store de lista. */
export function useTablaListaUi<TFiltro extends number = number>(
  useStore: ListaUiStore<TFiltro>
) {
  const busqueda = useStore((s) => s.busqueda)
  const actualizarBusqueda = useStore((s) => s.actualizarBusqueda)
  const pageIndex = useStore((s) => s.pageIndex)
  const pageSize = useStore((s) => s.pageSize)
  const actualizarPaginacion = useStore((s) => s.actualizarPaginacion)

  return {
    globalFilter: busqueda,
    onGlobalFilterChange: actualizarBusqueda as OnChangeFn<string>,
    pagination: { pageIndex, pageSize } satisfies PaginationState,
    onPaginationChange: actualizarPaginacion
  }
}
