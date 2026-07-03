/**
 * @vitest-environment jsdom
 */
import { ZonaDeFaseDTO } from '@/api/clients'
import { TooltipProvider } from '@/design-system/base-ui/tooltip'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DatosFaseLectura } from './datos-fase-lectura'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock
  }
})

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [],
    isLoading: false,
    isError: false
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn()
  })
}))

vi.mock('@/api/hooks/use-api-mutation', () => ({
  default: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: undefined
  })
}))

function renderDatosFaseLectura() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <DatosFaseLectura
          formato='Todos contra todos'
          zonas={[
            new ZonaDeFaseDTO({
              id: 42,
              nombre: 'Zona A',
              cantidadDeEquipos: 4,
              orden: 1
            })
          ]}
          torneoId={1}
          faseId={10}
          nombreTorneo='Torneo Test'
          nombreFase='Fase 1'
          categorias={[]}
        />
      </TooltipProvider>
    </MemoryRouter>
  )
}

describe('DatosFaseLectura — modal leyendas de zona', () => {
  afterEach(() => {
    cleanup()
    navigateMock.mockReset()
  })

  it('no navega al fixture al interactuar dentro del modal de leyendas', () => {
    renderDatosFaseLectura()

    fireEvent.click(screen.getByRole('button', { name: 'Leyendas de la zona' }))

    const dialog = screen.getByRole('dialog', { name: /leyendas de la zona/i })
    expect(dialog).toBeTruthy()

    fireEvent.click(screen.getByLabelText('Nueva Leyenda'))
    expect(navigateMock).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()

    fireEvent.click(screen.getByLabelText('Quitar puntos'))
    expect(navigateMock).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('sigue navegando al fixture al hacer clic en la fila de la zona', () => {
    renderDatosFaseLectura()

    fireEvent.click(
      screen.getByRole('button', { name: 'Ir al fixture de Zona A' })
    )

    expect(navigateMock).toHaveBeenCalledWith(
      '/torneos/detalle/1/fases/10/zonas/42/fixture'
    )
  })
})
