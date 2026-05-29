import { create } from 'zustand'

type Updater<T> = T | ((old: T) => T)

function resolverUpdater<T>(updater: Updater<T>, viejo: T): T {
  return typeof updater === 'function'
    ? (updater as (o: T) => T)(viejo)
    : updater
}

export type ListaUiPaginacion = {
  pageIndex: number
  pageSize: number
}

export type ListaUiState<TFiltro extends number = number> = {
  busqueda: string
  filtroEstados: TFiltro[]
  pageIndex: number
  pageSize: number
  setBusqueda: (busqueda: string) => void
  actualizarBusqueda: (updater: Updater<string>) => void
  toggleFiltro: (estado: TFiltro) => void
  actualizarPaginacion: (updater: Updater<ListaUiPaginacion>) => void
  limpiar: () => void
  resetParaTests: () => void
}

type OpcionesListaUiStore = {
  pageSize?: number
}

export function createListaUiStore<TFiltro extends number = number>(
  opciones: OpcionesListaUiStore = {}
) {
  const pageSizeDefault = opciones.pageSize ?? 10

  const estadoInicial = {
    busqueda: '',
    filtroEstados: [] as TFiltro[],
    pageIndex: 0,
    pageSize: pageSizeDefault
  }

  return create<ListaUiState<TFiltro>>((set, get) => ({
    ...estadoInicial,
    setBusqueda: (busqueda) => set({ busqueda, pageIndex: 0 }),
    actualizarBusqueda: (updater) => {
      const busqueda = resolverUpdater(updater, get().busqueda)
      set({ busqueda, pageIndex: 0 })
    },
    toggleFiltro: (estado) => {
      const prev = get().filtroEstados
      const nuevos = prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
      set({ filtroEstados: nuevos, pageIndex: 0 })
    },
    actualizarPaginacion: (updater) => {
      set((s) => {
        const viejo: ListaUiPaginacion = {
          pageIndex: s.pageIndex,
          pageSize: s.pageSize
        }
        const siguiente = resolverUpdater(updater, viejo)
        return {
          pageIndex: siguiente.pageIndex,
          pageSize: siguiente.pageSize
        }
      })
    },
    limpiar: () =>
      set({
        busqueda: '',
        filtroEstados: [],
        pageIndex: 0
      }),
    resetParaTests: () => set(estadoInicial)
  }))
}
