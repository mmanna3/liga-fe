import { HttpClientWrapper } from '@/api/http-client-wrapper'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const http = new HttpClientWrapper()

/** PUT /api/Torneo/{torneoId}/fases/reordenar */
export async function fasesReordenar(
  torneoId: number,
  faseIds: number[]
): Promise<void> {
  const url = `${API_BASE_URL}/api/Torneo/${torneoId}/fases/reordenar`
  const response = await http.fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain'
    },
    body: JSON.stringify({ faseIds })
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Error ${response.status}`)
  }
}
