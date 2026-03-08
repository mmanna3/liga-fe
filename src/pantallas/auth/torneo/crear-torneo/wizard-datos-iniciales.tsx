import type { DatosWizardTorneo } from './tipos'

export const datosIniciales: DatosWizardTorneo = {
  nombre: '',
  temporada: new Date().getFullYear().toString(),
  tipo: '',
  categorias: [],
  formato: '',
  fases: [],
  sumarPuntosAnuales: false,
  indiceFaseActual: 0,
  cantidadEquipos: 16,
  equiposSeleccionados: [],
  modoBusqueda: 'name',
  filtroAnio: '',
  filtroTipo: '',
  filtroTorneo: '',
  filtroFase: '',
  filtroZona: '',
  zonas: [],
  cantidadZonas: 1,
  prevenirMismoClub: false,
  fechasLibres: 0,
  fechasInterzonales: 0,
  fixtureGenerado: false,
  prevenirChoquesDeClub: false,
  estado: 'draft'
}
