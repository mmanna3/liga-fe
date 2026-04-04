import { FechaTodosContraTodosDTO } from '@/api/clients'
import { HttpClientWrapper } from '@/api/http-client-wrapper'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const http = new HttpClientWrapper()

/**
 * Listado de fechas de una zona todos-contra-todos.
 *
 * `api.fechasAll` tipa como `FechaDTO[]` y `FechaDTO.fromJS` no copia `numero` (solo existe en
 * `FechaTodosContraTodosDTO`). El backend sí envía `numero`; hay que deserializar con ese DTO.
 */
export async function fechasListarTodosContraTodos(
  zonaId: number
): Promise<FechaTodosContraTodosDTO[]> {
  const url = `${API_BASE_URL}/api/Zona/${zonaId}/fechas`
  const response = await http.fetch(url, {
    method: 'GET',
    headers: { Accept: 'text/plain' }
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Error ${response.status} al cargar fechas`)
  }
  const text = await response.text()
  const data = text === '' ? null : JSON.parse(text)
  if (!Array.isArray(data)) return []
  return data.map((item: unknown) => FechaTodosContraTodosDTO.fromJS(item))
}
