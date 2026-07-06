import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn()
}))

vi.mock('@/api/http-client-wrapper', () => ({
  HttpClientWrapper: class {
    fetch = fetchMock
  }
}))

import { grupoDeFasesCambiarVisibilidadEnApp } from './visibilidad-en-app-api'

describe('grupoDeFasesCambiarVisibilidadEnApp', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({ ok: true })
  })

  it('llama al endpoint PUT de visibilidad del grupo de fases', async () => {
    await grupoDeFasesCambiarVisibilidadEnApp(5, 12, false)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/Torneo/5/grupos-de-fases/12/visibilidad-en-app')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body as string)).toEqual({ esVisibleEnApp: false })
  })

  it('propaga el error cuando la API responde con fallo', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'No existe el grupo de fases'
    })

    await expect(
      grupoDeFasesCambiarVisibilidadEnApp(1, 2, true)
    ).rejects.toThrow('No existe el grupo de fases')
  })
})
