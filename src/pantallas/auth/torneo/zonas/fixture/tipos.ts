import type { EquipoDeLaZonaDTO } from '@/api/clients'

/**
 * Variante de jornada Interzonal (`numero` en el backend). En generación de
 * fixture se usan típicamente 1–4; en otros flujos puede ser cualquier entero ≥ 1.
 */
export type ItemFixture =
  | { type: 'equipo'; equipo: EquipoDeLaZonaDTO }
  | { type: 'especial'; valor: 'LIBRE' }
  | { type: 'especial'; valor: 'INTERZONAL'; numero: number }

/** Etiqueta para jornadas Interzonal persistidas o `numero` del DTO. */
export function etiquetaInterzonal(numero: number | undefined | null): string {
  const n = numero ?? 1
  return n === 1 ? 'Interzonal' : `Interzonal ${n}`
}

/** Fondo + borde + texto (sin padding/tamaño) para chips Interzonal. 1–4 fijos; 5+ rota paleta extra. */
export function clasesInterzonalFondo(numero: number): string {
  const n = Number.isFinite(numero) && numero >= 1 ? Math.floor(numero) : 1
  const base: [string, string, string, string] = [
    'bg-blue-100 border border-blue-300 text-blue-800',
    'bg-emerald-100 border border-emerald-300 text-emerald-800',
    'bg-violet-100 border border-violet-300 text-violet-800',
    'bg-rose-100 border border-rose-300 text-rose-800'
  ]
  if (n <= 4) return base[n - 1]
  const extra = [
    'bg-sky-100 border border-sky-300 text-sky-900',
    'bg-orange-100 border border-orange-300 text-orange-900',
    'bg-cyan-100 border border-cyan-300 text-cyan-900',
    'bg-fuchsia-100 border border-fuchsia-300 text-fuchsia-900',
    'bg-lime-100 border border-lime-400 text-lime-900',
    'bg-indigo-100 border border-indigo-300 text-indigo-900',
    'bg-pink-100 border border-pink-300 text-pink-900',
    'bg-teal-100 border border-teal-300 text-teal-900'
  ]
  return extra[(n - 5) % extra.length]
}

/** Vista previa / celdas compactas: `text-* bg-* px-1 rounded` */
export function claseVistaPreviaInterzonalPorNumero(numero: number): string {
  const n = Number.isFinite(numero) && numero >= 1 ? Math.floor(numero) : 1
  const base: [string, string, string, string] = [
    'text-blue-700 bg-blue-100 px-1 rounded',
    'text-emerald-800 bg-emerald-100 px-1 rounded',
    'text-violet-800 bg-violet-100 px-1 rounded',
    'text-rose-800 bg-rose-100 px-1 rounded'
  ]
  if (n <= 4) return base[n - 1]
  const extra = [
    'text-sky-900 bg-sky-100 px-1 rounded',
    'text-orange-900 bg-orange-100 px-1 rounded',
    'text-cyan-900 bg-cyan-100 px-1 rounded',
    'text-fuchsia-900 bg-fuchsia-100 px-1 rounded',
    'text-lime-900 bg-lime-100 px-1 rounded',
    'text-indigo-800 bg-indigo-100 px-1 rounded',
    'text-pink-900 bg-pink-100 px-1 rounded',
    'text-teal-900 bg-teal-100 px-1 rounded'
  ]
  return extra[(n - 5) % extra.length]
}

export function labelItem(item: ItemFixture): string {
  if (item.type === 'equipo') {
    return (
      [item.equipo.codigo, item.equipo.nombre, item.equipo.club]
        .filter(Boolean)
        .join(' · ') || '—'
    )
  }
  if (item.valor === 'LIBRE') return 'Libre'
  return etiquetaInterzonal(item.numero)
}

/** Chip de lista (borde + fondo) para arrastrables y filas. */
export function estilosChipEspecial(item: ItemFixture): string {
  if (item.type !== 'especial') return ''
  if (item.valor === 'LIBRE') {
    return 'px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-medium'
  }
  return `px-2 py-0.5 rounded font-medium ${clasesInterzonalFondo(item.numero)}`
}

/** Estilo compacto para celdas de vista previa (nombre ya resuelto con `labelItem`). */
export function claseVistaPreviaEspecial(label: string): string {
  if (label === 'Libre') return 'text-yellow-700 bg-yellow-100 px-1 rounded'
  if (label === 'Interzonal') return claseVistaPreviaInterzonalPorNumero(1)
  const m = /^Interzonal (\d+)$/.exec(label)
  if (m) return claseVistaPreviaInterzonalPorNumero(Number(m[1]))
  return ''
}
