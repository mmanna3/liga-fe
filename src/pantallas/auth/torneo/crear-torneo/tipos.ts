export interface Categoria {
  id: string
  nombre: string
  anioDesde: string
  anioHasta: string
  /** Orden de visualización / persistencia (1-based, alineado con `TorneoCategoriaDTO.orden`). */
  orden: number
}
