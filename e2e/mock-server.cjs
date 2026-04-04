#!/usr/bin/env node
/**
 * Servidor HTTP mock para tests E2E (Playwright).
 *
 * Variables de entorno:
 *   MOCK_PORT  Puerto donde escucha (default: 3001)
 *   SCENARIO   Escenario de respuestas (default: 'happy')
 *
 * Escenarios disponibles:
 *   happy                    Happy path: login exitoso, listas vacías
 *   credenciales_invalidas   login devuelve exito: false
 *   clubs_con_datos          Lista de clubes con dos clubes de ejemplo
 *   jugadores_con_datos      Lista de jugadores con un jugador activo
 *   jugador_pendiente        Jugador con estado pendiente de aprobación
 *   delegados_con_datos      Lista de delegados con un delegado activo
 *   delegado_pendiente       Delegado con estado pendiente de aprobación
 *   torneos_con_datos        Lista de torneos con un torneo de ejemplo
 *   torneo_con_agrupadores   Agrupadores disponibles + crear torneo habilitado
 *   torneo_detalle           Torneo con fases (no editable, para navegar a zonas)
 *   torneo_editable          Torneo con fases editable (para guardar cambios)
 *   torneo_zonas_vacio       Página de zonas sin zonas creadas, equipos disponibles
 *   torneo_zonas_con_datos   Página de zonas con una zona y equipo asignado
 */
const http = require('http')
const { URL } = require('url')

const PORT = process.env.MOCK_PORT || 3001
let SCENARIO = process.env.SCENARIO || 'happy'

// ---------------------------------------------------------------------------
// JWT mínimo decodificable por jwtDecode
// ---------------------------------------------------------------------------
const headerB64 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
const payloadB64 = Buffer.from(
  JSON.stringify({ role: 'Administrador', name: 'Admin E2E', exp: 9999999999 })
).toString('base64url')
const TOKEN_E2E = `${headerB64}.${payloadB64}.fake-e2e-signature`

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLUB_1 = {
  id: 1,
  nombre: 'Club Defensores del Norte',
  direccion: 'Av. Siempreviva 742',
  localidad: 'Capital',
  esTechado: false,
  escudo: null,
  delegados: [],
  equipos: []
}
const CLUB_2 = {
  id: 2,
  nombre: 'Atlético San Martín',
  direccion: null,
  localidad: 'Villa del Parque',
  esTechado: true,
  escudo: null,
  delegados: [],
  equipos: []
}

const JUGADOR_1 = {
  id: 1,
  nombre: 'Juan',
  apellido: 'González',
  dni: '12345678',
  fechaNacimiento: '2010-05-15T00:00:00',
  delegadoId: null,
  fotoDNIFrente: null,
  fotoDNIDorso: null,
  fotoCarnet: null,
  equipos: [
    {
      id: 10,
      nombre: 'Infantil A',
      torneo: 'Torneo Apertura 2026',
      estado: 3,
      club: 'Club Defensores del Norte',
      motivo: null
    }
  ]
}

const JUGADOR_PENDIENTE = {
  id: 1,
  nombre: 'Juan',
  apellido: 'González',
  dni: '12345678',
  fechaNacimiento: '2010-05-15T00:00:00',
  delegadoId: null,
  fotoDNIFrente: null,
  fotoDNIDorso: null,
  fotoCarnet: null,
  equipos: [
    {
      id: 10,
      nombre: 'Infantil A',
      torneo: 'Torneo Apertura 2026',
      estado: 1,
      club: 'Club Defensores del Norte',
      motivo: null
    }
  ]
}

const DELEGADO_1 = {
  id: 1,
  nombre: 'Carlos',
  apellido: 'Martínez',
  dni: '87654321',
  fechaNacimiento: '1990-01-15T00:00:00',
  email: 'carlos@example.com',
  telefonoCelular: '1122334455',
  jugadorId: null,
  blanqueoPendiente: false,
  fotoDNIFrente: null,
  fotoDNIDorso: null,
  usuario: { nombreUsuario: 'carlos.martinez' },
  delegadoClubs: [
    {
      id: 10,
      clubNombre: 'Club Defensores del Norte',
      estadoDelegado: { id: 2, estado: 'Activo' }
    }
  ]
}

const DELEGADO_PENDIENTE = {
  id: 1,
  nombre: 'Carlos',
  apellido: 'Martínez',
  dni: '87654321',
  fechaNacimiento: '1990-01-15T00:00:00',
  email: 'carlos@example.com',
  telefonoCelular: '1122334455',
  jugadorId: null,
  blanqueoPendiente: false,
  fotoDNIFrente: null,
  fotoDNIDorso: null,
  usuario: { nombreUsuario: 'carlos.martinez' },
  delegadoClubs: [
    {
      id: 10,
      clubNombre: 'Club Defensores del Norte',
      estadoDelegado: { id: 1, estado: 'Pendiente de aprobación' }
    }
  ]
}

const AGRUPADOR_1 = { id: 1, nombre: 'Liga Infantil' }

const EQUIPO_PARA_ZONA_1 = {
  id: 1,
  nombre: 'Infantil A',
  club: 'Club Defensores del Norte',
  codigoAlfanumerico: 'A001',
  zonas: []
}
const EQUIPO_PARA_ZONA_2 = {
  id: 2,
  nombre: 'Infantil B',
  club: 'Atlético San Martín',
  codigoAlfanumerico: 'B002',
  zonas: []
}

const ZONA_1 = {
  id: 1,
  nombre: 'Zona A',
  equipos: [
    {
      id: '1',
      nombre: 'Infantil A',
      club: 'Club Defensores del Norte',
      codigo: 'A001'
    }
  ]
}

const ZONA_FIXTURE = {
  id: 1,
  nombre: 'Zona A',
  equipos: [
    { id: 1, nombre: 'Infantil A', club: 'Club Defensores del Norte', codigo: 'A001' },
    { id: 2, nombre: 'Infantil B', club: 'Atlético San Martín', codigo: 'B002' }
  ]
}

const ALGORITMO_2_EQUIPOS = {
  id: 1,
  fixtureAlgoritmoId: 1,
  cantidadDeEquipos: 2,
  fechas: [{ id: 1, fecha: 1, equipoLocal: 1, equipoVisitante: 2 }]
}

const ALGORITMO_2_EQUIPOS_SIN_FECHAS = {
  id: 1,
  fixtureAlgoritmoId: 1,
  cantidadDeEquipos: 2,
  fechas: []
}

const FECHA_ZONA_1 = {
  id: 1,
  numero: 1,
  dia: null,
  zonaId: 1,
  esVisibleEnApp: false,
  jornadas: [
    {
      id: 1,
      tipo: 'Normal',
      resultadosVerificados: false,
      fechaId: 1,
      localId: 1,
      visitanteId: 2,
      local: 'Infantil A',
      visitante: 'Infantil B',
      partidos: [
        {
          id: 1,
          categoriaId: 1,
          categoria: 'Sub 12',
          resultadoLocal: '',
          resultadoVisitante: ''
        }
      ]
    }
  ]
}

const FECHA_ZONA_CON_DIA = {
  ...FECHA_ZONA_1,
  dia: '2026-05-15T00:00:00'
}

const FECHA_ZONA_CON_RESULTADOS = {
  id: 1,
  numero: 1,
  dia: null,
  zonaId: 1,
  esVisibleEnApp: false,
  jornadas: [
    {
      id: 1,
      tipo: 'Normal',
      resultadosVerificados: false,
      fechaId: 1,
      localId: 1,
      visitanteId: 2,
      local: 'Infantil A',
      visitante: 'Infantil B',
      partidos: [
        { id: 1, categoriaId: 1, categoria: 'Sub 12', resultadoLocal: '2', resultadoVisitante: '1' }
      ]
    }
  ]
}

const FECHA_ZONA_RESULTADOS_VERIFICADOS = {
  id: 1,
  numero: 1,
  dia: null,
  zonaId: 1,
  esVisibleEnApp: false,
  jornadas: [
    {
      id: 1,
      tipo: 'Normal',
      resultadosVerificados: true,
      fechaId: 1,
      localId: 1,
      visitanteId: 2,
      local: 'Infantil A',
      visitante: 'Infantil B',
      partidos: [
        { id: 1, categoriaId: 1, categoria: 'Sub 12', resultadoLocal: '2', resultadoVisitante: '1' }
      ]
    }
  ]
}

// Zona con 3 equipos (cantidad inválida para eliminación directa)
const ZONA_FIXTURE_ELIMINACION_3 = {
  id: 2,
  nombre: 'Zona B',
  equipos: [
    { id: 1, nombre: 'Infantil A', club: 'Club Defensores del Norte', codigo: 'A001' },
    { id: 2, nombre: 'Infantil B', club: 'Atlético San Martín', codigo: 'B002' },
    { id: 3, nombre: 'Infantil C', club: 'Club Norte', codigo: 'C003' }
  ]
}

// Zona con 4 equipos (válida para eliminación directa)
const ZONA_FIXTURE_ELIMINACION = {
  id: 2,
  nombre: 'Zona B',
  equipos: [
    { id: 1, nombre: 'Infantil A', club: 'Club Defensores del Norte', codigo: 'A001' },
    { id: 2, nombre: 'Infantil B', club: 'Atlético San Martín', codigo: 'B002' },
    { id: 3, nombre: 'Infantil C', club: 'Club Norte', codigo: 'C003' },
    { id: 4, nombre: 'Infantil D', club: 'Club Sur', codigo: 'D004' }
  ]
}

const TORNEO_CON_FASE_ELIMINACION = {
  id: 1,
  nombre: 'Torneo Apertura 2026',
  anio: 2026,
  torneoAgrupadorId: 1,
  torneoAgrupadorNombre: 'Liga Infantil',
  sePuedeEditar: false,
  categorias: [
    { id: 1, nombre: 'Sub 12', anioDesde: 2014, anioHasta: 2015, torneoId: 1 }
  ],
  fases: [
    {
      id: 200,
      numero: 1,
      nombre: 'Segunda Fase',
      tipoDeFase: 2,
      tipoDeFaseNombre: 'Eliminación directa',
      sePuedeEditar: false,
      zonas: [],
      estadoFaseId: 100
    }
  ]
}

// Llave de 4 equipos: Semifinal (instanciaId=4) + Final vacía (instanciaId=2)
const FECHA_ELIMINACION_SEMIFINAL = {
  id: 10,
  instanciaId: 4,
  instanciaNombre: 'Semifinal',
  dia: null,
  zonaId: 2,
  esVisibleEnApp: false,
  jornadas: [
    {
      id: 10,
      tipo: 'Normal',
      resultadosVerificados: false,
      fechaId: 10,
      localId: 1,
      visitanteId: 2,
      local: 'Infantil A',
      visitante: 'Infantil B',
      partidos: [{ id: 10, categoriaId: 1, categoria: 'Sub 12', resultadoLocal: '', resultadoVisitante: '' }]
    },
    {
      id: 11,
      tipo: 'Normal',
      resultadosVerificados: false,
      fechaId: 10,
      localId: 3,
      visitanteId: 4,
      local: 'Infantil C',
      visitante: 'Infantil D',
      partidos: [{ id: 11, categoriaId: 1, categoria: 'Sub 12', resultadoLocal: '', resultadoVisitante: '' }]
    }
  ]
}

const FECHA_ELIMINACION_FINAL = {
  id: 11,
  instanciaId: 2,
  instanciaNombre: 'Final',
  dia: null,
  zonaId: 2,
  esVisibleEnApp: false,
  jornadas: [
    {
      id: 12,
      tipo: 'SinEquipos',
      resultadosVerificados: false,
      fechaId: 11,
      partidos: [{ id: 12, categoriaId: 1, categoria: 'Sub 12', resultadoLocal: '', resultadoVisitante: '' }]
    }
  ]
}

const TORNEO_1 = {
  id: 1,
  nombre: 'Torneo Apertura 2026',
  anio: 2026,
  torneoAgrupadorId: null,
  torneoAgrupadorNombre: null,
  fases: []
}

const AGRUPADOR_DETALLE = {
  id: 1,
  nombre: 'Liga Infantil',
  visibleEnApp: true,
  torneos: [TORNEO_1]
}

const TORNEO_CON_FASES = {
  id: 1,
  nombre: 'Torneo Apertura 2026',
  anio: 2026,
  torneoAgrupadorId: 1,
  torneoAgrupadorNombre: 'Liga Infantil',
  sePuedeEditar: false,
  categorias: [
    { id: 1, nombre: 'Sub 12', anioDesde: 2014, anioHasta: 2015, torneoId: 1 }
  ],
  fases: [
    {
      id: 100,
      numero: 1,
      nombre: 'Primera Fase',
      tipoDeFase: 1,
      tipoDeFaseNombre: 'Todos contra todos',
      sePuedeEditar: false,
      zonas: [],
      estadoFaseId: 100
    }
  ]
}

const TORNEO_EDITABLE = {
  ...TORNEO_CON_FASES,
  sePuedeEditar: true,
  fases: [{ ...TORNEO_CON_FASES.fases[0], sePuedeEditar: true }]
}

const TORNEO_EDITABLE_CON_NUEVA_FASE = {
  ...TORNEO_EDITABLE,
  fases: [
    ...TORNEO_EDITABLE.fases,
    { id: 101, numero: 2, nombre: 'Nueva fase', tipoDeFase: 1, tipoDeFaseNombre: 'Todos contra todos', sePuedeEditar: true, zonas: [], estadoFaseId: 100 }
  ]
}

// ---------------------------------------------------------------------------
// Tabla de rutas
// ---------------------------------------------------------------------------

const ROUTES = [
  // Auth
  {
    method: 'POST',
    pattern: '/api/Auth/login',
    scenarios: {
      happy: { exito: true, token: TOKEN_E2E },
      credenciales_invalidas: { exito: false, token: null }
    }
  },

  // Clubs — lista
  {
    method: 'GET',
    pattern: '/api/Club',
    scenarios: { happy: [], clubs_con_datos: [CLUB_1, CLUB_2] }
  },
  // Clubs — detalle
  {
    method: 'GET',
    pattern: /^\/api\/Club\/\d+$/,
    scenarios: { happy: CLUB_1, clubs_con_datos: CLUB_1 }
  },
  // Clubs — crear
  {
    method: 'POST',
    pattern: '/api/Club',
    scenarios: { happy: { ...CLUB_1, id: 99 } }
  },
  // Clubs — editar
  { method: 'PUT', pattern: /^\/api\/Club\/\d+$/, scenarios: { happy: null } },
  // Clubs — eliminar
  { method: 'DELETE', pattern: /^\/api\/Club\/\d+$/, scenarios: { happy: 1 } },
  // Clubs — cambiar escudo
  {
    method: 'PUT',
    pattern: /^\/api\/Club\/\d+\/cambiar-escudo$/,
    scenarios: { happy: null }
  },

  // Equipos — lista
  { method: 'GET', pattern: '/api/Equipo', scenarios: { happy: [] } },
  // Equipos — para zonas
  {
    method: 'GET',
    pattern: '/api/Equipo/equipos-para-zonas',
    scenarios: {
      happy: [],
      torneo_zonas_vacio: [EQUIPO_PARA_ZONA_1, EQUIPO_PARA_ZONA_2],
      torneo_zonas_con_datos: [EQUIPO_PARA_ZONA_1, EQUIPO_PARA_ZONA_2]
    }
  },

  // Jugadores — lista con filtro
  {
    method: 'GET',
    pattern: /^\/api\/Jugador\/listar-con-filtro/,
    scenarios: {
      happy: [],
      jugadores_con_datos: [JUGADOR_1],
      jugador_pendiente: [JUGADOR_PENDIENTE]
    }
  },
  // Jugadores — detalle
  {
    method: 'GET',
    pattern: /^\/api\/Jugador\/\d+$/,
    scenarios: {
      happy: JUGADOR_1,
      jugadores_con_datos: JUGADOR_1,
      jugador_pendiente: JUGADOR_PENDIENTE
    }
  },
  // Jugadores — aprobar
  {
    method: 'POST',
    pattern: '/api/Jugador/aprobar-jugador',
    scenarios: { happy: 1 }
  },
  // Jugadores — rechazar
  {
    method: 'POST',
    pattern: '/api/Jugador/rechazar-jugador',
    scenarios: { happy: 1 }
  },

  // Delegados — lista con filtro
  {
    method: 'GET',
    pattern: /^\/api\/Delegado\/listar-delegados-con-filtro/,
    scenarios: {
      happy: [],
      delegados_con_datos: [DELEGADO_1],
      delegado_pendiente: [DELEGADO_PENDIENTE]
    }
  },
  // Delegados — detalle
  {
    method: 'GET',
    pattern: /^\/api\/Delegado\/\d+$/,
    scenarios: {
      happy: DELEGADO_1,
      delegados_con_datos: DELEGADO_1,
      delegado_pendiente: DELEGADO_PENDIENTE
    }
  },
  // Delegados — aprobar
  {
    method: 'POST',
    pattern: '/api/Delegado/aprobar-delegado-en-el-club',
    scenarios: { happy: {} }
  },
  // Delegados — eliminar/rechazar
  {
    method: 'DELETE',
    pattern: /^\/api\/Delegado\/\d+$/,
    scenarios: { happy: 1 }
  },

  // Torneos — filtrar
  {
    method: 'GET',
    pattern: /^\/api\/Torneo\/filtrar/,
    scenarios: {
      happy: [],
      torneos_con_datos: [TORNEO_1],
      torneo_detalle: [TORNEO_CON_FASES],
      torneo_editable: [TORNEO_EDITABLE],
      torneo_con_agrupadores: []
    }
  },
  // Torneos — detalle
  {
    method: 'GET',
    pattern: /^\/api\/Torneo\/\d+$/,
    scenarios: {
      happy: TORNEO_1,
      torneo_detalle: TORNEO_CON_FASES,
      torneo_editable: TORNEO_EDITABLE,
      torneo_editable_sin_fases: { ...TORNEO_EDITABLE, fases: [] },
      torneo_editable_con_nueva_fase: TORNEO_EDITABLE_CON_NUEVA_FASE,
      torneo_zonas_vacio: TORNEO_CON_FASES,
      torneo_zonas_con_datos: TORNEO_CON_FASES,
      fixture_sin_fechas: TORNEO_CON_FASES,
      fixture_algoritmo_sin_configurar: TORNEO_CON_FASES,
      fixture_con_fechas: TORNEO_CON_FASES,
      fixture_con_fechas_con_dia: TORNEO_CON_FASES,
      fixture_con_fechas_con_resultados: TORNEO_CON_FASES,
      fixture_con_fechas_resultados_verificados: TORNEO_CON_FASES,
      fixture_eliminacion_directa_3_equipos: TORNEO_CON_FASE_ELIMINACION,
      fixture_eliminacion_directa_sin_fechas: TORNEO_CON_FASE_ELIMINACION,
      fixture_eliminacion_directa_con_fechas: TORNEO_CON_FASE_ELIMINACION
    }
  },
  // Torneos — crear
  {
    method: 'POST',
    pattern: '/api/Torneo',
    scenarios: {
      happy: TORNEO_1,
      torneo_con_agrupadores: { ...TORNEO_1, id: 2 }
    }
  },
  // Fases de torneo — crear
  {
    method: 'POST',
    pattern: /^\/api\/Torneo\/\d+\/fases$/,
    scenarios: {
      happy: null,
      torneo_editable_con_nueva_fase: { id: 101, numero: 2, nombre: 'Nueva fase', tipoDeFase: 1, estadoFaseId: 100, esVisibleEnApp: true, sePuedeEditar: true, torneoId: 1 }
    }
  },
  // Fases de torneo — actualizar
  {
    method: 'PUT',
    pattern: /^\/api\/Torneo\/\d+\/fases\/\d+$/,
    scenarios: { happy: null }
  },
  // Fases de torneo — eliminar
  {
    method: 'DELETE',
    pattern: /^\/api\/Torneo\/\d+\/fases\/\d+$/,
    scenarios: { happy: 1, torneo_editable: 1, torneo_editable_sin_fases: 1 }
  },
  // Torneos — actualizar
  {
    method: 'PUT',
    pattern: /^\/api\/Torneo\/\d+$/,
    scenarios: { happy: null }
  },
  // Torneos — eliminar
  {
    method: 'DELETE',
    pattern: /^\/api\/Torneo\/\d+$/,
    scenarios: { happy: 1 }
  },

  // Agrupadores de torneo — lista
  {
    method: 'GET',
    pattern: '/api/TorneoAgrupador',
    scenarios: {
      happy: [],
      torneo_con_agrupadores: [AGRUPADOR_1],
      torneo_detalle: [AGRUPADOR_1],
      torneo_editable: [AGRUPADOR_1],
      torneo_zonas_vacio: [AGRUPADOR_1],
      torneo_zonas_con_datos: [AGRUPADOR_1]
    }
  },
  // Agrupadores de torneo — detalle
  {
    method: 'GET',
    pattern: /^\/api\/TorneoAgrupador\/\d+$/,
    scenarios: {
      happy: AGRUPADOR_DETALLE,
      torneo_con_agrupadores: AGRUPADOR_DETALLE
    }
  },
  // Agrupadores de torneo — crear
  {
    method: 'POST',
    pattern: '/api/TorneoAgrupador',
    scenarios: {
      happy: { id: 99, nombre: 'Nuevo Agrupador', visibleEnApp: true },
      torneo_con_agrupadores: { id: 99, nombre: 'Nuevo Agrupador', visibleEnApp: true }
    }
  },
  // Agrupadores de torneo — editar
  {
    method: 'PUT',
    pattern: /^\/api\/TorneoAgrupador\/\d+$/,
    scenarios: {
      happy: null,
      torneo_con_agrupadores: null
    }
  },
  // Agrupadores de torneo — eliminar
  {
    method: 'DELETE',
    pattern: /^\/api\/TorneoAgrupador\/\d+$/,
    scenarios: { happy: 1, torneo_con_agrupadores: 1 }
  },

  // Zonas de una fase — lista
  {
    method: 'GET',
    pattern: /^\/api\/Fase\/\d+\/zonas$/,
    scenarios: {
      happy: [],
      torneo_zonas_vacio: [],
      torneo_zonas_con_datos: [ZONA_1],
      fixture_sin_fechas: [ZONA_FIXTURE],
      fixture_algoritmo_sin_configurar: [ZONA_FIXTURE],
      fixture_con_fechas: [ZONA_FIXTURE],
      fixture_con_fechas_con_dia: [ZONA_FIXTURE],
      fixture_con_fechas_con_resultados: [ZONA_FIXTURE],
      fixture_con_fechas_resultados_verificados: [ZONA_FIXTURE],
      fixture_eliminacion_directa_3_equipos: [ZONA_FIXTURE_ELIMINACION_3],
      fixture_eliminacion_directa_sin_fechas: [ZONA_FIXTURE_ELIMINACION],
      fixture_eliminacion_directa_con_fechas: [ZONA_FIXTURE_ELIMINACION]
    }
  },
  // Zonas — crear masivamente
  {
    method: 'POST',
    pattern: /^\/api\/Fase\/\d+\/zonas\/crear-zonas-masivamente$/,
    scenarios: { happy: [ZONA_1] }
  },
  // Zonas — modificar masivamente
  {
    method: 'PUT',
    pattern: /^\/api\/Fase\/\d+\/zonas\/modificar-zonas-masivamente$/,
    scenarios: { happy: null }
  },

  // FixtureAlgoritmo — lista
  {
    method: 'GET',
    pattern: '/api/FixtureAlgoritmo',
    scenarios: {
      happy: [],
      fixture_sin_fechas: [ALGORITMO_2_EQUIPOS],
      fixture_algoritmo_sin_configurar: [ALGORITMO_2_EQUIPOS_SIN_FECHAS],
      fixture_con_fechas: [ALGORITMO_2_EQUIPOS],
      fixture_con_fechas_con_dia: [ALGORITMO_2_EQUIPOS],
      fixture_con_fechas_con_resultados: [ALGORITMO_2_EQUIPOS],
      fixture_con_fechas_resultados_verificados: [ALGORITMO_2_EQUIPOS],
      fixture_eliminacion_directa_3_equipos: [],
      fixture_eliminacion_directa_sin_fechas: [],
      fixture_eliminacion_directa_con_fechas: []
    }
  },

  // Fechas de una zona — lista
  {
    method: 'GET',
    pattern: /^\/api\/Zona\/\d+\/fechas$/,
    scenarios: {
      happy: [],
      fixture_sin_fechas: [],
      fixture_algoritmo_sin_configurar: [],
      fixture_con_fechas: [FECHA_ZONA_1],
      fixture_con_fechas_con_dia: [FECHA_ZONA_CON_DIA],
      fixture_con_fechas_con_resultados: [FECHA_ZONA_CON_RESULTADOS],
      fixture_con_fechas_resultados_verificados: [FECHA_ZONA_RESULTADOS_VERIFICADOS],
      fixture_eliminacion_directa_3_equipos: [],
      fixture_eliminacion_directa_sin_fechas: [],
      fixture_eliminacion_directa_con_fechas: [FECHA_ELIMINACION_SEMIFINAL, FECHA_ELIMINACION_FINAL]
    }
  },

  // Fechas — crear masivamente
  {
    method: 'POST',
    pattern: /^\/api\/Zona\/\d+\/fechas\/crear-fechas-masivamente$/,
    scenarios: { happy: [FECHA_ZONA_1] }
  },

  // Fechas — crear individual
  {
    method: 'POST',
    pattern: /^\/api\/Zona\/\d+\/fechas$/,
    scenarios: { happy: FECHA_ZONA_1, fixture_con_fechas: FECHA_ZONA_1, fixture_con_fechas_con_dia: FECHA_ZONA_CON_DIA }
  },

  // Fechas — editar
  {
    method: 'PUT',
    pattern: /^\/api\/Zona\/\d+\/fechas\/\d+$/,
    scenarios: { happy: FECHA_ZONA_1, fixture_con_fechas: FECHA_ZONA_1, fixture_con_fechas_con_dia: FECHA_ZONA_CON_DIA }
  },

  // Fechas — eliminar
  {
    method: 'DELETE',
    pattern: /^\/api\/Zona\/\d+\/fechas\/\d+$/,
    scenarios: { happy: 1, fixture_con_fechas: 1, fixture_con_fechas_con_dia: 1 }
  },

  // Fechas — cargar resultados de una jornada
  {
    method: 'POST',
    pattern: /^\/api\/Zona\/\d+\/fechas\/cargar-resultados\/\d+$/,
    scenarios: {
      happy: null,
      fixture_con_fechas: null,
      fixture_con_fechas_con_dia: null,
      fixture_con_fechas_con_resultados: null,
      fixture_con_fechas_resultados_verificados: null,
      fixture_eliminacion_directa_con_fechas: null
    }
  },

  // Fechas — crear llave de eliminación directa
  {
    method: 'POST',
    pattern: /^\/api\/Zona\/\d+\/fechas\/crear-fechas-eliminaciondirecta-masivamente$/,
    scenarios: {
      happy: null,
      fixture_eliminacion_directa_sin_fechas: null,
      fixture_eliminacion_directa_3_equipos: null
    }
  },

  // Fechas — borrar llave de eliminación directa
  {
    method: 'DELETE',
    pattern: /^\/api\/Zona\/\d+\/fechas\/borrar-fechas-eliminaciondirecta-masivamente$/,
    scenarios: {
      happy: null,
      fixture_eliminacion_directa_con_fechas: null
    }
  }
]

function matchRoute(method, pathname) {
  for (const route of ROUTES) {
    if (route.method !== method) continue
    if (typeof route.pattern === 'string') {
      if (pathname === route.pattern) return route
    } else {
      if (route.pattern.test(pathname)) return route
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Servidor
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = parsedUrl.pathname

  console.log(`[mock] ${req.method} ${req.url}`)

  if (req.method === 'POST' && pathname === '/_set-scenario') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        const { scenario } = JSON.parse(body)
        SCENARIO = scenario
        console.log(`[mock] Escenario cambiado a: ${scenario}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch {
        res.writeHead(400)
        res.end()
      }
    })
    return
  }

  const route = matchRoute(req.method, pathname)

  if (!route) {
    console.warn(`[mock] sin handler para ${req.method} ${pathname}`)
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({ error: `Sin mock para ${req.method} ${pathname}` })
    )
    return
  }

  const respond = () => {
    const responseBody = route.scenarios[SCENARIO] ?? route.scenarios['happy']
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(responseBody))
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', respond)
  } else {
    respond()
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[mock] corriendo en 0.0.0.0:${PORT}  (escenario: ${SCENARIO})`)
})
