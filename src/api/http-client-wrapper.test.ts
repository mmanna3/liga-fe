/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpClientWrapper } from './http-client-wrapper'

// Mock useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: {
    getState: vi.fn(() => ({
      token: null,
      logout: vi.fn()
    }))
  }
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}))

describe('HttpClientWrapper', () => {
  let wrapper: HttpClientWrapper
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    wrapper = new HttpClientWrapper()
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('no agrega Authorization header a rutas publicas', async () => {
    const { useAuth } = await import('@/hooks/use-auth')
    vi.mocked(useAuth.getState).mockReturnValue({
      token: 'my-token',
      logout: vi.fn()
    } as unknown as ReturnType<typeof useAuth.getState>)

    mockFetch.mockResolvedValue({ status: 200 })

    await wrapper.fetch('http://api.test/api/Publico/algo')

    const calledInit = mockFetch.mock.calls[0][1]
    expect(calledInit?.headers?.Authorization).toBeUndefined()
  })

  it('agrega Authorization header a rutas protegidas', async () => {
    const { useAuth } = await import('@/hooks/use-auth')
    vi.mocked(useAuth.getState).mockReturnValue({
      token: 'my-token',
      logout: vi.fn()
    } as unknown as ReturnType<typeof useAuth.getState>)

    mockFetch.mockResolvedValue({ status: 200 })

    await wrapper.fetch('http://api.test/api/Equipo/1')

    const calledInit = mockFetch.mock.calls[0][1]
    expect(calledInit.headers.Authorization).toBe('Bearer my-token')
  })

  it('no agrega header si no hay token', async () => {
    const { useAuth } = await import('@/hooks/use-auth')
    vi.mocked(useAuth.getState).mockReturnValue({
      token: null,
      logout: vi.fn()
    } as unknown as ReturnType<typeof useAuth.getState>)

    mockFetch.mockResolvedValue({ status: 200 })

    await wrapper.fetch('http://api.test/api/Equipo/1')

    const calledInit = mockFetch.mock.calls[0][1]
    expect(calledInit).toBeUndefined()
  })

  it('hace logout en respuesta 401', async () => {
    const logoutMock = vi.fn()
    const { useAuth } = await import('@/hooks/use-auth')
    vi.mocked(useAuth.getState).mockReturnValue({
      token: 'my-token',
      logout: logoutMock
    } as unknown as ReturnType<typeof useAuth.getState>)

    mockFetch.mockResolvedValue({ status: 401 })

    await expect(
      wrapper.fetch('http://api.test/api/Equipo/1')
    ).rejects.toThrow('Token vencido')

    expect(logoutMock).toHaveBeenCalled()
  })

  it('hace logout en respuesta 403', async () => {
    const logoutMock = vi.fn()
    const { useAuth } = await import('@/hooks/use-auth')
    vi.mocked(useAuth.getState).mockReturnValue({
      token: 'my-token',
      logout: logoutMock
    } as unknown as ReturnType<typeof useAuth.getState>)

    mockFetch.mockResolvedValue({ status: 403 })

    await expect(
      wrapper.fetch('http://api.test/api/Equipo/1')
    ).rejects.toThrow('Usuario no tiene permisos')

    expect(logoutMock).toHaveBeenCalled()
  })
})
