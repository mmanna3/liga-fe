export interface WizardTeam {
  id: number
  name: string
  club: string
  tournament: string
  zone: string
}

export interface Category {
  id: string
  name: string
  yearFrom: string
  yearTo: string
}

export interface Phase {
  id: string
  name: string
  format: 'all-vs-all' | 'elimination'
  rounds: 'single' | 'double'
  zoneFormats: Record<string, 'all-vs-all' | 'elimination'>
  tiebreakers: string[]
  transitionMode: 'manual' | 'automatic'
  qualifiersPerZone: number
  qualifiersStartPosition: number
  qualifiersEndPosition: number
  crossGroupQualifiers: number
  comparisonMode: 'total-points' | 'average-points'
  enableTriangular: boolean
  tieResolution: 'penalties' | 'extra-time' | 'advantage'
  transitionRules: string[]
  completed: boolean
}

export interface Zone {
  id: string
  name: string
  teams: WizardTeam[]
  phaseId: string
}

export interface TournamentWizardData {
  name: string
  season: string
  type: 'FUTSAL' | 'BABY' | 'FUTBOL 11' | 'FEMENINO' | ''
  categories: Category[]
  format: 'ANUAL' | 'RELAMPAGO' | 'MUNDIAL' | 'PERSONALIZADO' | ''

  phases: Phase[]
  sumAnnualPoints: boolean
  currentPhaseIndex: number

  teamCount: number
  selectedTeams: WizardTeam[]
  searchMode: 'name' | 'tournament'
  filterTournament: string
  filterZone: string

  zones: Zone[]
  zonesCount: number
  preventSameClub: boolean

  hasFreeBye: boolean
  hasInterzonal: boolean
  fixtureGenerated: boolean
  numberOfDates: number
  preventClubClash: boolean

  status: 'draft' | 'published'
}
