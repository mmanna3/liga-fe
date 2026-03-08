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
  formato: 'todos-contra-todos' | 'eliminacion'
  vueltas: 'ida' | 'ida-y-vuelta'
  formatosPorZona: Record<string, 'todos-contra-todos' | 'eliminacion'>
  desempates: string[]
  modoTransicion: 'manual' | 'automatico'
  clasificadosPorZona: number
  posicionInicioClasificados: number
  posicionFinClasificados: number
  clasificadosCruzados: number
  modoComparacion: 'puntos-totales' | 'promedio-puntos'
  habilitarTriangular: boolean
  resolucionDesempate: 'penales' | 'tiempo-extra' | 'ventaja'
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
  modoBusqueda: 'nombre' | 'torneo'
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

  estado: 'borrador' | 'publicado'
}
