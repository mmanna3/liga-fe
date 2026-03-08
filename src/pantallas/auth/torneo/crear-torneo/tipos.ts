export interface EquipoWizard {
  id: number
  nombre: string
  club: string
  torneo: string
  zona: string
  /** Año del torneo (para filtro "Desde otro torneo") */
  anio?: string
  /** Tipo (FUTSAL, BABY, FUTBOL 11) para filtro */
  tipo?: string
  /** Fase (Apertura, Clausura) para filtro */
  fase?: string
}

export interface Categoria {
  id: string
  nombre: string
  anioDesde: string
  anioHasta: string
}

export interface Fase {
  id: string
  nombre: string
  formato: 'all-vs-all' | 'elimination'
  vueltas: 'single' | 'double'
  formatosPorZona: Record<string, 'all-vs-all' | 'elimination'>
  desempates: string[]
  modoTransicion: 'manual' | 'automatic'
  clasificadosPorZona: number
  posicionInicioClasificados: number
  posicionFinClasificados: number
  clasificadosCruzados: number
  modoComparacion: 'total-points' | 'average-points'
  habilitarTriangular: boolean
  resolucionDesempate: 'penalties' | 'extra-time' | 'advantage'
  reglasTransicion: string[]
  completada: boolean
}

export interface Zona {
  id: string
  nombre: string
  equipos: EquipoWizard[]
  idFase: string
  /** Cantidad de fechas en que cada equipo de esta zona queda libre (por zona) */
  fechasLibres: number
  /** Cantidad de fechas interzonales por equipo en esta zona. Todas las zonas deben tener el mismo valor para poder emparejar. */
  fechasInterzonales: number
}

export interface DatosWizardTorneo {
  nombre: string
  temporada: string
  tipo: 'FUTSAL' | 'BABY' | 'FUTBOL 11' | 'FEMENINO' | ''
  categorias: Categoria[]
  formato: 'ANUAL' | 'RELAMPAGO' | 'MUNDIAL' | 'PERSONALIZADO' | ''

  fases: Fase[]
  sumarPuntosAnuales: boolean
  indiceFaseActual: number

  cantidadEquipos: number
  equiposSeleccionados: EquipoWizard[]
  modoBusqueda: 'name' | 'tournament'
  filtroAnio: string
  filtroTipo: string
  filtroTorneo: string
  filtroFase: string
  filtroZona: string

  zonas: Zona[]
  cantidadZonas: number
  prevenirMismoClub: boolean

  fechasLibres: number
  fechasInterzonales: number
  fixtureGenerado: boolean
  prevenirChoquesDeClub: boolean

  estado: 'draft' | 'published'
}
