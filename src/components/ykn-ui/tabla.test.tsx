import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnDef } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import Tabla from './tabla'

interface Jugador {
  id: number
  nombre: string
  apellido: string
  dni: string
}

const columnas: ColumnDef<Jugador>[] = [
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'apellido', header: 'Apellido' },
  { accessorKey: 'dni', header: 'DNI' }
]

const jugadores: Jugador[] = [
  { id: 1, nombre: 'Juan', apellido: 'Perez', dni: '12345678' },
  { id: 2, nombre: 'Maria', apellido: 'Lopez', dni: '87654321' },
  { id: 3, nombre: 'Carlos', apellido: 'Garcia', dni: '11223344' }
]

describe('Tabla', () => {
  it('renderiza los headers y datos correctamente', () => {
    render(
      <Tabla
        columnas={columnas}
        data={jugadores}
        estaCargando={false}
        hayError={false}
      />
    )

    const table = screen.getByRole('table')
    expect(within(table).getByText('Nombre')).toBeInTheDocument()
    expect(within(table).getByText('Apellido')).toBeInTheDocument()
    expect(within(table).getByText('DNI')).toBeInTheDocument()

    expect(within(table).getByText('Juan')).toBeInTheDocument()
    expect(within(table).getByText('Perez')).toBeInTheDocument()
    expect(within(table).getByText('Maria')).toBeInTheDocument()
    expect(within(table).getByText('Lopez')).toBeInTheDocument()
  })

  it('muestra mensaje de cargando', () => {
    render(
      <Tabla
        columnas={columnas}
        data={[]}
        estaCargando={true}
        hayError={false}
      />
    )

    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('muestra mensaje de error', () => {
    render(
      <Tabla
        columnas={columnas}
        data={[]}
        estaCargando={false}
        hayError={true}
      />
    )

    expect(
      screen.getByText(/error al cargar los datos/i)
    ).toBeInTheDocument()
  })

  it('muestra mensaje cuando no hay resultados', () => {
    render(
      <Tabla
        columnas={columnas}
        data={[]}
        estaCargando={false}
        hayError={false}
      />
    )

    expect(
      screen.getByText('No se encontraron resultados.')
    ).toBeInTheDocument()
  })

  it('filtra datos con el buscador', async () => {
    const user = userEvent.setup()
    render(
      <Tabla
        columnas={columnas}
        data={jugadores}
        estaCargando={false}
        hayError={false}
      />
    )

    const buscador = screen.getByPlaceholderText('Buscar...')
    await user.type(buscador, 'Maria')

    const table = screen.getByRole('table')
    expect(within(table).getByText('Maria')).toBeInTheDocument()
    expect(within(table).queryByText('Juan')).not.toBeInTheDocument()
    expect(within(table).queryByText('Carlos')).not.toBeInTheDocument()
  })

  it('muestra el conteo de registros', () => {
    render(
      <Tabla
        columnas={columnas}
        data={jugadores}
        estaCargando={false}
        hayError={false}
      />
    )

    expect(screen.getByText(/Registros:/)).toBeInTheDocument()
  })

  it('pagina correctamente con pageSizeDefault', () => {
    const muchosDatos = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      nombre: `Jugador${i + 1}`,
      apellido: `Apellido${i + 1}`,
      dni: `${10000000 + i}`
    }))

    render(
      <Tabla
        columnas={columnas}
        data={muchosDatos}
        estaCargando={false}
        hayError={false}
        pageSizeDefault={5}
      />
    )

    const table = screen.getByRole('table')
    expect(within(table).getByText('Jugador1')).toBeInTheDocument()
    expect(within(table).getByText('Jugador5')).toBeInTheDocument()
    expect(within(table).queryByText('Jugador6')).not.toBeInTheDocument()
    expect(screen.getByText('1 de 3')).toBeInTheDocument()
  })
})
