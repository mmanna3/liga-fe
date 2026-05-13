import { EstadoJugador } from '@/logica-compartida/utils'
import { create } from 'zustand'

type Updater<T> = T | ((old: T) => T)

function resolverUpdater<T>(updater: Updater<T>, viejo: T): T {
  return typeof updater === 'function'
    ? (updater as (o: T) => T)(viejo)
    : updater
}

export type JugadoresListaPaginacion = {
  pageIndex: number
  pageSize: number
}

type JugadoresListaUiState = {
  filtroEstados: EstadoJugador[]
  pageIndex: number
  pageSize: number
  toggleFiltro: (estado: EstadoJugador) => void
  actualizarPaginacion: (updater: Updater<JugadoresListaPaginacion>) => void
  resetParaTests: () => void
}

const estadoInicial = {
  filtroEstados: [] as EstadoJugador[],
  pageIndex: 0,
  pageSize: 10
}

export const useJugadoresListaUiStore = create<JugadoresListaUiState>(
  (set, get) => ({
    ...estadoInicial,
    toggleFiltro: (estado) => {
      const prev = get().filtroEstados
      const nuevos = prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
      set({ filtroEstados: nuevos, pageIndex: 0 })
    },
    actualizarPaginacion: (updater) => {
      set((s) => {
        const viejo: JugadoresListaPaginacion = {
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
    resetParaTests: () => set(estadoInicial)
  })
)
