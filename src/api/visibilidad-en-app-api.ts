import { HttpClientWrapper } from '@/api/http-client-wrapper'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const http = new HttpClientWrapper()

async function putVisibilidadEnApp(
  path: string,
  esVisibleEnApp: boolean
): Promise<void> {
  const url = `${API_BASE_URL}${path}`
  const response = await http.fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain'
    },
    body: JSON.stringify({ esVisibleEnApp })
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Error ${response.status}`)
  }
}

/** PUT /api/Torneo/{id}/visibilidad-en-app */
export async function torneoCambiarVisibilidadEnApp(
  torneoId: number,
  esVisibleEnApp: boolean
): Promise<void> {
  await putVisibilidadEnApp(
    `/api/Torneo/${torneoId}/visibilidad-en-app`,
    esVisibleEnApp
  )
}

/** PUT /api/Torneo/{torneoId}/fases/{faseId}/visibilidad-en-app */
export async function faseCambiarVisibilidadEnApp(
  torneoId: number,
  faseId: number,
  esVisibleEnApp: boolean
): Promise<void> {
  await putVisibilidadEnApp(
    `/api/Torneo/${torneoId}/fases/${faseId}/visibilidad-en-app`,
    esVisibleEnApp
  )
}

/** PUT /api/Zona/{zonaId}/fechas/{fechaId}/visibilidad-en-app */
export async function fechaCambiarVisibilidadEnApp(
  zonaId: number,
  fechaId: number,
  esVisibleEnApp: boolean
): Promise<void> {
  await putVisibilidadEnApp(
    `/api/Zona/${zonaId}/fechas/${fechaId}/visibilidad-en-app`,
    esVisibleEnApp
  )
}
