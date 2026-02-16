const MENSAJE_POR_DEFECTO = 'Error desconocido'

export function parsearErrorApi(
  error: unknown,
  mensajePorDefecto: string = MENSAJE_POR_DEFECTO
): string {
  try {
    if (
      error instanceof Error &&
      'response' in error &&
      typeof (error as { response: unknown }).response === 'string'
    ) {
      const parsed = JSON.parse((error as { response: string }).response)
      if (typeof parsed?.title === 'string') {
        return parsed.title
      }
    }
  } catch {
    // JSON.parse falló, usamos el mensaje por defecto
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return mensajePorDefecto
}
