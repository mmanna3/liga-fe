import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './use-auth'

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({
    role: 'Administrador',
    name: 'Test User'
  }))
}))

// Mock api
vi.mock('@/api/api', () => ({
  api: {
    login: vi.fn()
  }
}))

describe('useAuth', () => {
  afterEach(() => {
    // Reset store state
    useAuth.setState({
      token: null,
      isAuthenticated: false,
      userRole: null,
      userName: null
    })
  })

  it('tiene estado inicial correcto', () => {
    const state = useAuth.getState()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.userRole).toBeNull()
    expect(state.userName).toBeNull()
  })

  it('login exitoso setea token y usuario', async () => {
    const { api } = await import('@/api/api')
    vi.mocked(api.login).mockResolvedValue({
      exito: true,
      token: 'fake-jwt-token'
    } as ReturnType<typeof api.login> extends Promise<infer T> ? T : never)

    const resultado = await useAuth.getState().login('admin', '1234')

    expect(resultado).toBe(true)
    const state = useAuth.getState()
    expect(state.token).toBe('fake-jwt-token')
    expect(state.isAuthenticated).toBe(true)
    expect(state.userRole).toBe('Administrador')
    expect(state.userName).toBe('Test User')
  })

  it('login fallido no cambia el estado', async () => {
    const { api } = await import('@/api/api')
    vi.mocked(api.login).mockResolvedValue({
      exito: false,
      token: undefined
    } as ReturnType<typeof api.login> extends Promise<infer T> ? T : never)

    const resultado = await useAuth.getState().login('admin', 'wrong')

    expect(resultado).toBe(false)
    expect(useAuth.getState().isAuthenticated).toBe(false)
  })

  it('login con error de red retorna false', async () => {
    const { api } = await import('@/api/api')
    vi.mocked(api.login).mockRejectedValue(new Error('Network error'))

    const resultado = await useAuth.getState().login('admin', '1234')

    expect(resultado).toBe(false)
    expect(useAuth.getState().isAuthenticated).toBe(false)
  })

  it('logout limpia el estado', () => {
    useAuth.setState({
      token: 'some-token',
      isAuthenticated: true,
      userRole: 'Administrador',
      userName: 'Admin'
    })

    useAuth.getState().logout()

    const state = useAuth.getState()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.userRole).toBeNull()
    expect(state.userName).toBeNull()
  })

  it('esAdmin retorna true para rol Administrador', () => {
    useAuth.setState({ userRole: 'Administrador' })
    expect(useAuth.getState().esAdmin()).toBe(true)
  })

  it('esAdmin retorna false para otros roles', () => {
    useAuth.setState({ userRole: 'Delegado' })
    expect(useAuth.getState().esAdmin()).toBe(false)
  })

  it('esAdmin retorna false si no hay rol', () => {
    expect(useAuth.getState().esAdmin()).toBe(false)
  })
})
