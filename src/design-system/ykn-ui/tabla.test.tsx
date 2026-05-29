/**
 * @vitest-environment jsdom
 */
import Tabla from './tabla'
import { createListaUiStore } from '@/logica-compartida/stores/create-lista-ui-store'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { ColumnDef } from '@tanstack/react-table'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

type Fila = { id: number; nombre: string }

const columnas: ColumnDef<Fila>[] = [
  { accessorKey: 'nombre', header: 'Nombre' }
]

const filas: Fila[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  nombre: `Item ${i + 1}`
}))

const useListaUiStore = createListaUiStore()

function TablaConEstadoPersistido() {
  const tablaListaUi = useTablaListaUi(useListaUiStore)

  return (
    <Tabla<Fila>
      columnas={columnas}
      data={filas}
      estaCargando={false}
      hayError={false}
      {...tablaListaUi}
    />
  )
}

describe('Tabla con estado de lista controlado', () => {
  beforeEach(() => {
    useListaUiStore.getState().resetParaTests()
  })

  afterEach(() => {
    cleanup()
  })

  it('muestra la búsqueda persistida en el input', () => {
    useListaUiStore.getState().setBusqueda('Item 2')
    render(<TablaConEstadoPersistido />)

    const input = screen.getByPlaceholderText('Buscar...') as HTMLInputElement
    expect(input.value).toBe('Item 2')
  })

  it('persiste búsqueda y página al escribir y paginar', () => {
    render(<TablaConEstadoPersistido />)

    const botones = screen.getAllByRole('button')
    fireEvent.click(botones[botones.length - 1]!)
    expect(useListaUiStore.getState().pageIndex).toBe(1)

    const input = screen.getByPlaceholderText('Buscar...') as HTMLInputElement
    fireEvent.change(input, {
      target: { value: 'Item 21' }
    })
    expect(useListaUiStore.getState().busqueda).toBe('Item 21')
    expect(useListaUiStore.getState().pageIndex).toBe(0)
  })
})
