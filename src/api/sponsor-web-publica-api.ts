import { HttpClientWrapper } from './http-client-wrapper'

const http = new HttpClientWrapper()

function getBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
}

export interface SponsorWebPublicaDTO {
  id?: number
  nombre: string
  orden?: number
  imagen?: string
}

export interface CrearSponsorWebPublicaDTO {
  nombre: string
  imagenBase64: string
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Error ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function sponsorWebPublicaAll(): Promise<SponsorWebPublicaDTO[]> {
  const response = await http.fetch(`${getBaseUrl()}/api/SponsorWebPublica`)
  return parseJson(response)
}

export async function sponsorWebPublicaPOST(
  body: CrearSponsorWebPublicaDTO
): Promise<SponsorWebPublicaDTO> {
  const response = await http.fetch(`${getBaseUrl()}/api/SponsorWebPublica`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  })
  return parseJson(response)
}

export async function sponsorWebPublicaDELETE(id: number): Promise<number> {
  const response = await http.fetch(
    `${getBaseUrl()}/api/SponsorWebPublica/${id}`,
    { method: 'DELETE' }
  )
  return parseJson(response)
}
