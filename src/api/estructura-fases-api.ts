import { HttpClientWrapper } from '@/api/http-client-wrapper'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const http = new HttpClientWrapper()

export type EstructuraFasesItemPayload =
  | { tipo: 'fase'; faseId: number }
  | { tipo: 'grupo'; grupoId: number; items: EstructuraFasesItemPayload[] }

export async function estructuraFasesPUT(
  torneoId: number,
  items: EstructuraFasesItemPayload[]
): Promise<void> {
  const url = `${API_BASE_URL}/api/Torneo/${torneoId}/estructura-fases`
  const response = await http.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
    body: JSON.stringify({ items })
  })
  if (!response.ok) {
    throw new Error(await response.text())
  }
}
