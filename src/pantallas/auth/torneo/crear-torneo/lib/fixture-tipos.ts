// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface EntradaFixture {
  id: string
  tipo: 'regular' | 'libre' | 'interzonal'
  local: string
  visitante: string
  idEquipoLocal: number | null
  idEquipoVisitante: number | null
}

export interface FechaFixture {
  numeroFecha: number
  entradas: EntradaFixture[]
}

export interface EstadisticasEquipo {
  idEquipo: number
  nombreEquipo: string
  partidosDeLocal: number
  partidosDeVisitante: number
  fechasLibre: number
  fechasInterzonal: number
}

export interface EstadisticasFixture {
  totalFechas: number
  estadisticasPorEquipo: EstadisticasEquipo[]
  /** Cuántas veces debe enfrentarse cada par: 1 (ida) o 2 (ida-y-vuelta) */
  encuentrosPorParEsperados: number
  partidosLocalEsperados: number
  partidosVisitanteEsperados: number
  /** Diferencias respecto a la distribución ideal */
  excepciones: string[]
}

export interface FixturePorZona {
  idZona: string
  nombreZona: string
  fechas: FechaFixture[]
  estadisticas: EstadisticasFixture
}

export interface ValidacionZona {
  idZona: string
  nombreZona: string
  cantidadEquipos: number
  totalParticipantes: number
  esValida: boolean
}

export interface ValidacionEmparejamientoInterzonal {
  esValido: boolean
  mensaje: string
}

// ─── Tipos internos ──────────────────────────────────────────────────────────

export type TipoParticipante = 'equipo' | 'libre' | 'interzonal'

export interface Participante {
  tipo: TipoParticipante
  idEquipo: number | null
  nombre: string
}

export interface EntradaDeZona {
  id: string
  nombre: string
  equipos: { id: number; nombre: string }[]
  /** Cantidad de fechas libres por equipo en esta zona */
  fechasLibres: number
  /** Cantidad de fechas interzonales por equipo. Todas las zonas deben tener el mismo valor para emparejar. */
  fechasInterzonales: number
}
