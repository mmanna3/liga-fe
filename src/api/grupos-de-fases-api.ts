import { HttpClientWrapper } from '@/api/http-client-wrapper'
import type { IGrupoDeFasesDTO } from '@/api/clients'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const http = new HttpClientWrapper()

export async function gruposDeFasesPOST(
  torneoId: number,
  body: IGrupoDeFasesDTO
): Promise<IGrupoDeFasesDTO> {
  const url = `${API_BASE_URL}/api/Torneo/${torneoId}/grupos-de-fases`
  const response = await http.fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error(await response.text())
  }
  return response.json()
}

export async function gruposDeFasesPUT(
  torneoId: number,
  grupoId: number,
  body: IGrupoDeFasesDTO
): Promise<void> {
  const url = `${API_BASE_URL}/api/Torneo/${torneoId}/grupos-de-fases/${grupoId}`
  const response = await http.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error(await response.text())
  }
}

export async function gruposDeFasesDELETE(
  torneoId: number,
  grupoId: number
): Promise<void> {
  const url = `${API_BASE_URL}/api/Torneo/${torneoId}/grupos-de-fases/${grupoId}`
  const response = await http.fetch(url, {
    method: 'DELETE',
    headers: { Accept: 'text/plain' }
  })
  if (!response.ok) {
    throw new Error(await response.text())
  }
}
