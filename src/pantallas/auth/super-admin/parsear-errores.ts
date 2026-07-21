import { ApiException } from '@/api/clients'

export function parsearErrores(error: unknown): string[] {
  if (!error) return []

  if (ApiException.isApiException(error)) {
    try {
      const parsed = JSON.parse(error.response)
      if (parsed?.errors) {
        return Object.values(parsed.errors).flat() as string[]
      }
      if (parsed?.title) return [parsed.title]
      if (typeof parsed === 'string') return [parsed]
      if (parsed?.detail) return [parsed.detail]
      if (parsed?.mensaje) return [parsed.mensaje]
    } catch {
      if (error.response) return [error.response]
    }
  }

  return []
}
