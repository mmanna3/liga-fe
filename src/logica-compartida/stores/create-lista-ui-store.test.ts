import { beforeEach, describe, expect, it } from 'vitest'
import { createListaUiStore } from './create-lista-ui-store'

describe('createListaUiStore', () => {
  const useListaUiStore = createListaUiStore<number>()

  beforeEach(() => {
    useListaUiStore.getState().resetParaTests()
  })

  it('tiene estado inicial vacío y página 0', () => {
    const s = useListaUiStore.getState()
    expect(s.busqueda).toBe('')
    expect(s.filtroEstados).toEqual([])
    expect(s.pageIndex).toBe(0)
    expect(s.pageSize).toBe(10)
  })

  it('setBusqueda y actualizarBusqueda reinician la página a 0', () => {
    useListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 3, pageSize: 10 })
    useListaUiStore.getState().setBusqueda('river')
    expect(useListaUiStore.getState().busqueda).toBe('river')
    expect(useListaUiStore.getState().pageIndex).toBe(0)

    useListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 2, pageSize: 10 })
    useListaUiStore.getState().actualizarBusqueda((b) => `${b}x`)
    expect(useListaUiStore.getState().busqueda).toBe('riverx')
    expect(useListaUiStore.getState().pageIndex).toBe(0)
  })

  it('toggleFiltro agrega, quita estados y reinicia la página', () => {
    const { toggleFiltro } = useListaUiStore.getState()
    toggleFiltro(1)
    expect(useListaUiStore.getState().filtroEstados).toEqual([1])
    toggleFiltro(2)
    expect(useListaUiStore.getState().filtroEstados).toEqual([1, 2])
    toggleFiltro(1)
    expect(useListaUiStore.getState().filtroEstados).toEqual([2])

    useListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 3, pageSize: 10 })
    toggleFiltro(3)
    expect(useListaUiStore.getState().pageIndex).toBe(0)
  })

  it('actualizarPaginacion acepta objeto o actualizador en función', () => {
    useListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 2, pageSize: 10 })
    expect(useListaUiStore.getState().pageIndex).toBe(2)

    useListaUiStore.getState().actualizarPaginacion((p) => ({
      ...p,
      pageIndex: p.pageIndex + 1
    }))
    expect(useListaUiStore.getState().pageIndex).toBe(3)
  })

  it('resetParaTests vuelve al estado inicial', () => {
    useListaUiStore.getState().setBusqueda('boca')
    useListaUiStore.getState().toggleFiltro(9)
    useListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 2, pageSize: 10 })
    useListaUiStore.getState().resetParaTests()
    const s = useListaUiStore.getState()
    expect(s.busqueda).toBe('')
    expect(s.filtroEstados).toEqual([])
    expect(s.pageIndex).toBe(0)
    expect(s.pageSize).toBe(10)
  })

  it('respeta pageSize personalizado', () => {
    const useStoreCustom = createListaUiStore({ pageSize: 25 })
    expect(useStoreCustom.getState().pageSize).toBe(25)
  })
})
