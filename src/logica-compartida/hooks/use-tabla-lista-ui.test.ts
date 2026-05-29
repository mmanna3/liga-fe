/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { createListaUiStore } from '@/logica-compartida/stores/create-lista-ui-store'
import { useTablaListaUi } from './use-tabla-lista-ui'
import { renderHook, act } from '@testing-library/react'

describe('useTablaListaUi', () => {
  const useListaUiStore = createListaUiStore<number>()

  beforeEach(() => {
    useListaUiStore.getState().resetParaTests()
  })

  it('expone búsqueda y paginación del store para Tabla', () => {
    useListaUiStore.getState().setBusqueda('san lorenzo')
    useListaUiStore
      .getState()
      .actualizarPaginacion({ pageIndex: 4, pageSize: 10 })

    const { result } = renderHook(() => useTablaListaUi(useListaUiStore))

    expect(result.current.globalFilter).toBe('san lorenzo')
    expect(result.current.pagination).toEqual({ pageIndex: 4, pageSize: 10 })
  })

  it('delega cambios de búsqueda y paginación al store', () => {
    const { result } = renderHook(() => useTablaListaUi(useListaUiStore))

    act(() => {
      result.current.onGlobalFilterChange('racing')
    })
    expect(useListaUiStore.getState().busqueda).toBe('racing')
    expect(useListaUiStore.getState().pageIndex).toBe(0)

    act(() => {
      useListaUiStore
        .getState()
        .actualizarPaginacion({ pageIndex: 1, pageSize: 10 })
    })
    act(() => {
      result.current.onPaginationChange({ pageIndex: 2, pageSize: 10 })
    })
    expect(useListaUiStore.getState().pageIndex).toBe(2)
  })
})
