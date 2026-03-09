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
}

export interface Zona {
  id: string
  nombre: string
  equipos: EquipoWizard[]
  idFase: string
  /** Cantidad de fechas en que cada equipo de esta zona queda libre (0, 1 o 2). */
  fechasLibres: number
  /** Cantidad de fechas interzonales por equipo en esta zona (0, 1 o 2). */
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
