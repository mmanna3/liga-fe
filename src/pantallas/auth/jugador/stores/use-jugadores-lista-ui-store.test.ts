import { EstadoJugador } from '@/logica-compartida/utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { useJugadoresListaUiStore } from './use-jugadores-lista-ui-store'

describe('useJugadoresListaUiStore', () => {
  beforeEach(() => {
    useJugadoresListaUiStore.getState().resetParaTests()
  })

  it('tiene estado inicial vacío y página 0', () => {
    const s = useJugadoresListaUiStore.getState()
    expect(s.filtroEstados).toEqual([])
    expect(s.pageIndex).toBe(0)
    expect(s.pageSize).toBe(10)
  })

  it('toggleFiltro agrega y quita estados', () => {
    const { toggleFiltro } = useJugadoresListaUiStore.getState()
    toggleFiltro(EstadoJugador.Activo)
    expect(useJugadoresListaUiStore.getState().filtroEstados).toEqual([
      EstadoJugador.Activo
    ])
    toggleFiltro(EstadoJugador.Suspendido)
    expect(useJugadoresListaUiStore.getState().filtroEstados).toEqual([
      EstadoJugador.Activo,
      EstadoJugador.Suspendido
    ])
    toggleFiltro(EstadoJugador.Activo)
    expect(useJugadoresListaUiStore.getState().filtroEstados).toEqual([
      EstadoJugador.Suspendido
    ])
  })

  it('toggleFiltro reinicia la página a 0', () => {
    useJugadoresListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 3, pageSize: 10 })
    useJugadoresListaUiStore.getState().toggleFiltro(EstadoJugador.Activo)
    expect(useJugadoresListaUiStore.getState().pageIndex).toBe(0)
  })

  it('actualizarPaginacion acepta objeto o actualizador en función', () => {
    useJugadoresListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 2, pageSize: 10 })
    expect(useJugadoresListaUiStore.getState().pageIndex).toBe(2)

    useJugadoresListaUiStore.getState().actualizarPaginacion((p) => ({
      ...p,
      pageIndex: p.pageIndex + 1
    }))
    expect(useJugadoresListaUiStore.getState().pageIndex).toBe(3)
  })

  it('resetParaTests vuelve al estado inicial', () => {
    useJugadoresListaUiStore.getState().toggleFiltro(EstadoJugador.Inhabilitado)
    useJugadoresListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 2, pageSize: 10 })
    useJugadoresListaUiStore.getState().resetParaTests()
    const s = useJugadoresListaUiStore.getState()
    expect(s.filtroEstados).toEqual([])
    expect(s.pageIndex).toBe(0)
    expect(s.pageSize).toBe(10)
  })
})
