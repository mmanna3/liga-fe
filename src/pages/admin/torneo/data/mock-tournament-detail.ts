export interface CategorySimple {
  id: string
  name: string
  yearFrom: string
  yearTo: string
}

export interface ZoneWithTeams {
  id: string
  name: string
  teams: { id: string; name: string }[]
}

export type PhaseFormat = 'TODOS_CONTRA_TODOS' | 'ELIMINACION_DIRECTA'
export type PhaseMatchType = 'SOLO_IDA' | 'IDA_Y_VUELTA'

export interface PhaseWithZones {
  id: string
  name: string
  status: 'published' | 'draft'
  format: PhaseFormat
  matchType: PhaseMatchType
  zones: ZoneWithTeams[]
}

export const LABEL_FORMAT: Record<PhaseFormat, string> = {
  TODOS_CONTRA_TODOS: 'Todos contra todos',
  ELIMINACION_DIRECTA: 'Eliminación directa'
}
export const LABEL_MATCH_TYPE: Record<PhaseMatchType, string> = {
  SOLO_IDA: 'Solo ida',
  IDA_Y_VUELTA: 'Ida y vuelta'
}

export interface TournamentDetail {
  id: string
  name: string
  season: string
  year: number
  type: 'FUTSAL' | 'BABY' | 'FUTBOL 11' | 'FEMENINO'
  status: 'draft' | 'published'
  format: 'ANUAL' | 'RELAMPAGO' | 'MUNDIAL' | 'PERSONALIZADO'
  categories: CategorySimple[]
  phases: PhaseWithZones[]
}

const equiposZonaA = [
  'Club Atlético Norte',
  'Deportivo Central',
  'Unión Deportiva',
  'Racing del Sur',
  'Independiente FC',
  'San Lorenzo',
  'Boca Juniors',
  'River Plate'
]
const equiposZonaB = [
  'Estudiantes',
  'Gimnasia',
  'Vélez Sarsfield',
  'Huracán',
  'Lanús',
  'Banfield',
  'Talleres',
  'Belgrano'
]
const equiposZonaC = [
  'Newell\'s',
  'Rosario Central',
  'Colón',
  'Unión',
  'Argentinos Juniors',
  'Ferro',
  'Platense',
  'Defensa y Justicia'
]
const equiposCopa = [
  'Campeón Apertura',
  'Subcampeón Apertura',
  'Campeón Clausura',
  'Subcampeón Clausura',
  'Mejor tercero Apertura',
  'Mejor tercero Clausura',
  'Mejor cuarto Apertura',
  'Mejor cuarto Clausura'
]

function crearZona(
  id: string,
  nombre: string,
  equipos: string[]
): ZoneWithTeams {
  return {
    id,
    name: nombre,
    teams: equipos.map((n, i) => ({ id: `${id}-t${i}`, name: n }))
  }
}

export const mockTournamentsDetail: TournamentDetail[] = [
  {
    id: '1',
    name: 'Torneo Anual 2026',
    season: '2026',
    year: 2026,
    type: 'FUTSAL',
    status: 'published',
    format: 'ANUAL',
    categories: [
      { id: '1', name: 'Sub 15', yearFrom: '2010', yearTo: '2011' },
      { id: '2', name: 'Mayores', yearFrom: '', yearTo: '' }
    ],
    phases: [
      {
        id: '1',
        name: 'Apertura',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('ap-zona-a', 'ZONA A', equiposZonaA),
          crearZona('ap-zona-b', 'ZONA B', equiposZonaB),
          crearZona('ap-zona-c', 'ZONA C', equiposZonaC)
        ]
      },
      {
        id: '2',
        name: 'Clausura',
        status: 'draft',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('cl-zona-a', 'ZONA A', equiposZonaA),
          crearZona('cl-zona-b', 'ZONA B', equiposZonaB),
          crearZona('cl-zona-c', 'ZONA C', equiposZonaC)
        ]
      },
      {
        id: '3',
        name: 'Copa de campeones',
        status: 'draft',
        format: 'ELIMINACION_DIRECTA',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('copa-unica', 'FASE ÚNICA', equiposCopa)
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Torneo Anual 2025',
    season: '2025',
    year: 2025,
    type: 'BABY',
    status: 'published',
    format: 'ANUAL',
    categories: [{ id: '1', name: 'Sub 10', yearFrom: '2014', yearTo: '2015' }],
    phases: [
      {
        id: '1',
        name: 'Apertura',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('ap-zona-a', 'ZONA A', equiposZonaA),
          crearZona('ap-zona-b', 'ZONA B', equiposZonaB),
          crearZona('ap-zona-c', 'ZONA C', equiposZonaC)
        ]
      },
      {
        id: '2',
        name: 'Clausura',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('cl-zona-a', 'ZONA A', equiposZonaA),
          crearZona('cl-zona-b', 'ZONA B', equiposZonaB),
          crearZona('cl-zona-c', 'ZONA C', equiposZonaC)
        ]
      },
      {
        id: '3',
        name: 'Copa de campeones',
        status: 'draft',
        format: 'ELIMINACION_DIRECTA',
        matchType: 'SOLO_IDA',
        zones: [crearZona('copa-unica', 'FASE ÚNICA', equiposCopa)]
      }
    ]
  },
  {
    id: '3',
    name: 'Copa de Verano 2026',
    season: '2026',
    year: 2026,
    type: 'BABY',
    status: 'draft',
    format: 'RELAMPAGO',
    categories: [{ id: '1', name: 'Sub 12', yearFrom: '2012', yearTo: '2013' }],
    phases: [
      {
        id: '1',
        name: 'Fase única',
        status: 'draft',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [crearZona('z1', 'FASE ÚNICA', equiposZonaA)]
      }
    ]
  },
  {
    id: '4',
    name: 'Torneo Femenino 2026',
    season: '2026',
    year: 2026,
    type: 'FEMENINO',
    status: 'published',
    format: 'ANUAL',
    categories: [{ id: '1', name: 'Mayores', yearFrom: '', yearTo: '' }],
    phases: [
      {
        id: '1',
        name: 'Apertura',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('z1', 'ZONA A', equiposZonaA.slice(0, 4)),
          crearZona('z2', 'ZONA B', equiposZonaB.slice(0, 4))
        ]
      },
      {
        id: '2',
        name: 'Clausura',
        status: 'draft',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('z1', 'ZONA A', equiposZonaA.slice(0, 4)),
          crearZona('z2', 'ZONA B', equiposZonaB.slice(0, 4))
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Torneo Otoño 2026',
    season: '2026',
    year: 2026,
    type: 'FUTBOL 11',
    status: 'published',
    format: 'PERSONALIZADO',
    categories: [{ id: '1', name: 'Juveniles', yearFrom: '2008', yearTo: '2009' }],
    phases: [
      {
        id: '1',
        name: 'Fase única',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [crearZona('z1', 'FASE ÚNICA', equiposZonaA)]
      }
    ]
  },
  {
    id: '6',
    name: 'Copa Primavera 2025',
    season: '2025',
    year: 2025,
    type: 'BABY',
    status: 'published',
    format: 'RELAMPAGO',
    categories: [{ id: '1', name: 'Sub 14', yearFrom: '2010', yearTo: '2011' }],
    phases: [
      {
        id: '1',
        name: 'Fase única',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [crearZona('z1', 'FASE ÚNICA', equiposZonaA)]
      }
    ]
  },
  {
    id: '7',
    name: 'Torneo Invierno 2026',
    season: '2026',
    year: 2026,
    type: 'FUTSAL',
    status: 'draft',
    format: 'ANUAL',
    categories: [{ id: '1', name: '+40', yearFrom: '1984', yearTo: '' }],
    phases: [
      {
        id: '1',
        name: 'Apertura',
        status: 'draft',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [crearZona('z1', 'FASE ÚNICA', ['Veteranos 1', 'Veteranos 2'])]
      },
      {
        id: '2',
        name: 'Clausura',
        status: 'draft',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [crearZona('z1', 'FASE ÚNICA', ['Veteranos 1', 'Veteranos 2'])]
      }
    ]
  },
  {
    id: '8',
    name: 'Copa Femenina 2025',
    season: '2025',
    year: 2025,
    type: 'FEMENINO',
    status: 'published',
    format: 'RELAMPAGO',
    categories: [{ id: '1', name: 'Sub 16', yearFrom: '2008', yearTo: '2009' }],
    phases: [
      {
        id: '1',
        name: 'Fase única',
        status: 'published',
        format: 'TODOS_CONTRA_TODOS',
        matchType: 'SOLO_IDA',
        zones: [
          crearZona('z1', 'ZONA A', equiposZonaA.slice(0, 4)),
          crearZona('z2', 'ZONA B', equiposZonaB.slice(0, 4))
        ]
      }
    ]
  }
]
