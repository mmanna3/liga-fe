export const PREFIJO_TELEFONO_CELULAR = '+54911'
export const PREFIJO_TELEFONO_CELULAR_VISIBLE = '+54 9 11'

export function filtrarDigitosTelefonoCelular(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 8)
}

export function extraerDigitosTelefonoCelular(telefono?: string): string {
  if (!telefono?.trim()) return ''
  const soloDigitos = telefono.replace(/\D/g, '')
  if (soloDigitos.length >= 8) return soloDigitos.slice(-8)
  return soloDigitos
}

export function validarDigitosTelefonoCelular(digitos: string): string | null {
  if (digitos.length === 0) return null
  if (digitos.length !== 8) return 'Ingresá exactamente 8 números'
  return null
}

export function formatearTelefonoCelularParaBackend(
  digitos: string
): string | undefined {
  if (digitos.length === 0) return undefined
  if (digitos.length !== 8) return undefined
  return `${PREFIJO_TELEFONO_CELULAR}${digitos}`
}
