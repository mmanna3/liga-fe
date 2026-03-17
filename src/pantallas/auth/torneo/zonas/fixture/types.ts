import type { EquipoDeLaZonaDTO } from '@/api/clients'

export type ItemFixture =
  | { type: 'equipo'; equipo: EquipoDeLaZonaDTO }
  | { type: 'especial'; valor: 'LIBRE' | 'INTERZONAL' }

export function labelItem(item: ItemFixture): string {
  if (item.type === 'equipo') {
    return (
      [item.equipo.codigo, item.equipo.nombre, item.equipo.club]
        .filter(Boolean)
        .join(' · ') || '—'
    )
  }
  return item.valor === 'INTERZONAL' ? 'Interzonal' : 'Libre'
}
