import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RequiereAutenticacion } from './RequiereAutenticacion'

const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/use-auth', () => ({
  useAuth: mockUseAuth
}))

describe('RequiereAutenticacion', () => {
  it('muestra el contenido cuando el usuario esta autenticado', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path='/admin'
            element={
              <RequiereAutenticacion>
                <div>Contenido protegido</div>
              </RequiereAutenticacion>
            }
          />
          <Route path='/login' element={<div>Pagina de login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('redirige a /login cuando el usuario no esta autenticado', () => {
    cleanup()
    mockUseAuth.mockReturnValue({ isAuthenticated: false })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path='/admin'
            element={
              <RequiereAutenticacion>
                <div>Contenido protegido</div>
              </RequiereAutenticacion>
            }
          />
          <Route path='/login' element={<div>Pagina de login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    expect(screen.getByText('Pagina de login')).toBeInTheDocument()
  })
})
