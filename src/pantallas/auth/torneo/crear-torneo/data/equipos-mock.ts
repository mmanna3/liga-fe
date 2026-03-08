import type { EquipoWizard } from '../tipos'

function parsearMetaEquipo(torneo: string): {
  anio: string
  tipo: string
  fase: string
} {
  const matchAnio = torneo.match(/\b(202[4-9])\b/)
  const anio = matchAnio ? matchAnio[1] : ''
  let tipo = ''
  const t = torneo.toLowerCase()
  if (t.includes('futsal')) tipo = 'FUTSAL'
  else if (t.includes('futbol 11') || t.includes('futbol11')) tipo = 'FUTBOL 11'
  else if (
    t.includes('matutino') ||
    t.includes('vespertino') ||
    t.includes('infantiles')
  )
    tipo = 'BABY'
  let fase = ''
  if (t.includes('torneo final')) fase = 'Clausura'
  else if (
    t.includes('matutino') ||
    t.includes('vespertino') ||
    t.includes('apertura')
  )
    fase = 'Apertura'
  return { anio, tipo, fase }
}

const equiposCrudos: Array<Omit<EquipoWizard, 'anio' | 'tipo' | 'fase'>> = [
  {
    id: 557,
    nombre: 'Atl. San Martín',
    club: 'Atletico San Martin',
    torneo: 'Matutino 6 categorías 2025',
    zona: ''
  },
  {
    id: 556,
    nombre: 'El Tanque',
    club: 'El Tanque MAYORES',
    torneo: 'Futsal Mayores Torneo Final 2025',
    zona: 'Zona B'
  },
  {
    id: 555,
    nombre: 'Nueva Chicago',
    club: 'Nueva Chicago',
    torneo: 'Matutino 5 categorías 2025',
    zona: 'Zona "Bronce"'
  },
  {
    id: 554,
    nombre: 'El Retiro',
    club: 'El Retiro FUTBOL 11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 553,
    nombre: 'Soc. Italiana',
    club: 'Soc. Italiana FUTBOL 11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 552,
    nombre: 'Barrio Marina',
    club: 'Barrio Marina FUTSAL',
    torneo: 'Futsal Torneo Final 2025',
    zona: 'Zona B'
  },
  {
    id: 551,
    nombre: 'Centro Español',
    club: 'Centro Español FUTBOL11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 550,
    nombre: 'San José',
    club: 'San José FUTBOL 11',
    torneo: 'Futbol 11 Juveniles 2025',
    zona: 'Zona 3'
  },
  {
    id: 548,
    nombre: '17 de Agosto',
    club: '17 de Agosto Tatel MAYORES',
    torneo: 'Futsal Mayores Torneo Final 2025',
    zona: 'Zona B'
  },
  {
    id: 547,
    nombre: 'C. D. I.',
    club: 'Centro Deportivo Infantil FUTSAL',
    torneo: 'Futsal Torneo Final 2025',
    zona: 'Zona B'
  },
  {
    id: 546,
    nombre: '9 de Julio Azul',
    club: 'Atletico 9 de Julio',
    torneo: 'Matutino 5 categorías 2025',
    zona: 'Zona "Bronce"'
  },
  {
    id: 545,
    nombre: 'Salamanca',
    club: 'Salamanca',
    torneo: 'Vespertino 2025',
    zona: 'Zona "D"'
  },
  {
    id: 544,
    nombre: 'Buen Ayre',
    club: 'Buen Ayre Morris Club',
    torneo: 'Matutino 6 categorías 2025',
    zona: 'Zona "1"'
  },
  {
    id: 543,
    nombre: 'El Trébol Haedo',
    club: 'El Trébol Haedo FUTSAL',
    torneo: 'Futsal 2024',
    zona: ''
  },
  {
    id: 542,
    nombre: 'C. A. E. P.',
    club: 'C. A. El Palomar FUTSAL',
    torneo: 'Futsal 2024',
    zona: ''
  },
  {
    id: 541,
    nombre: 'Dep. Castelar',
    club: 'Deportivo Castelar FUTSAL',
    torneo: 'Futsal 2024',
    zona: ''
  },
  {
    id: 540,
    nombre: 'Deportivo El Tío',
    club: 'Deportivo El Tío FUTSAL',
    torneo: 'Futsal 2024',
    zona: ''
  },
  {
    id: 539,
    nombre: 'La Salita',
    club: 'S. F. La Salita FUTSAL',
    torneo: 'Futsal Torneo Final 2025',
    zona: 'Zona A'
  },
  {
    id: 538,
    nombre: 'M. Auxiliadora',
    club: 'Maria Auxiliadora FUTBOL 11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 537,
    nombre: 'Banfield',
    club: 'Banfield R.M. FUTBOL 11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 536,
    nombre: 'Inmaculada',
    club: 'Instituto Inmaculada FUTBOL 11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 535,
    nombre: 'Soc. Italiana',
    club: 'Soc. Italiana MAYORES',
    torneo: 'Futsal Mayores Torneo Final 2025',
    zona: 'Zona B'
  },
  {
    id: 534,
    nombre: 'S. F. Almafuerte',
    club: 'S. F. Almafuerte MAYORES',
    torneo: 'Futsal Mayores Torneo Final 2025',
    zona: 'Zona A'
  },
  {
    id: 533,
    nombre: 'S. F. Almafuerte',
    club: 'S. F. Almafuerte FUTSAL',
    torneo: 'Futsal Torneo Final 2025',
    zona: 'Zona A'
  },
  {
    id: 532,
    nombre: 'Inmaculada Rojo',
    club: 'Instituto Inmaculada FUTBOL 11',
    torneo: 'Futbol 11 Juveniles 2025',
    zona: 'Zona 2'
  },
  {
    id: 531,
    nombre: 'Recreo Jr.',
    club: 'Recreo FC',
    torneo: 'Matutino 5 categorías 2025',
    zona: 'Zona "Esmeralda"'
  },
  {
    id: 530,
    nombre: 'Mammana FC',
    club: 'Mammana FC FUTSAL',
    torneo: 'Futsal Torneo Final 2025',
    zona: 'Zona B'
  },
  {
    id: 529,
    nombre: 'Club Portugues',
    club: 'Club Portugues FUTBOL 11',
    torneo: 'Futbol 11 Juveniles 2025',
    zona: 'Zona 1'
  },
  {
    id: 528,
    nombre: 'River Plate',
    club: 'Escuela River San Justo FUTBOL 11',
    torneo: 'Futbol 11 infantiles 2025',
    zona: 'ZONA "A"'
  },
  {
    id: 527,
    nombre: 'C.A. Estudiantes',
    club: 'C. A. Estudiantes FUTBOL 11',
    torneo: 'Futbol 11 Juveniles 2025',
    zona: 'Zona 3'
  }
]

export const equiposMock: EquipoWizard[] = equiposCrudos.map((e) => {
  const meta = parsearMetaEquipo(e.torneo)
  return { ...e, anio: meta.anio, tipo: meta.tipo, fase: meta.fase }
})
