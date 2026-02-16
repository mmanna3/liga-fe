import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockNavigate = vi.hoisted(() => vi.fn())
const mockLogin = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}))

import Login from './login'

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockLogin.mockClear()
  })

  it('renderiza el formulario de login', () => {
    renderLogin()

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ingresar' })
    ).toBeInTheDocument()
  })

  it('permite escribir usuario y password', async () => {
    const user = userEvent.setup()
    renderLogin()

    const inputUsuario = screen.getByLabelText('Usuario')
    const inputPassword = screen.getByLabelText('Contraseña')

    await user.type(inputUsuario, 'admin')
    await user.type(inputPassword, '1234')

    expect(inputUsuario).toHaveValue('admin')
    expect(inputPassword).toHaveValue('1234')
  })

  it('navega a /admin despues de login exitoso', async () => {
    mockLogin.mockResolvedValue(true)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), '1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', '1234')
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true })
    })
  })

  it('muestra error cuando las credenciales son incorrectas', async () => {
    mockLogin.mockResolvedValue(false)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Usuario o contraseña incorrectos')
      ).toBeInTheDocument()
    })
  })

  it('muestra error cuando el login lanza una excepcion', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), '1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(
        screen.getByText('Error al intentar iniciar sesión')
      ).toBeInTheDocument()
    })
  })

  it('deshabilita los inputs y el boton mientras carga', async () => {
    mockLogin.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Usuario'), 'admin')
    await user.type(screen.getByLabelText('Contraseña'), '1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Usuario')).toBeDisabled()
      expect(screen.getByLabelText('Contraseña')).toBeDisabled()
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
