import { rutasNavegacion } from '@/routes/rutas'
import { Calendar, Layers, Plus, Search, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

interface Tournament {
  id: string
  name: string
  year: number
  type: 'FUTSAL' | 'BABY' | 'FUTBOL 11' | 'FEMENINO'
  status: 'draft' | 'published'
  phases: string[]
}

// Mock data - En una app real esto vendría de una base de datos
const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Torneo Anual 2026',
    year: 2026,
    type: 'FUTSAL',
    status: 'published',
    phases: ['Apertura', 'Clausura']
  },
  {
    id: '2',
    name: 'Torneo Anual 2025',
    year: 2025,
    type: 'BABY',
    status: 'published',
    phases: ['Apertura', 'Clausura']
  },
  {
    id: '3',
    name: 'Copa de Verano 2026',
    year: 2026,
    type: 'BABY',
    status: 'draft',
    phases: ['Fase única']
  },
  {
    id: '4',
    name: 'Torneo Femenino 2026',
    year: 2026,
    type: 'FEMENINO',
    status: 'published',
    phases: ['Apertura', 'Clausura']
  },
  {
    id: '5',
    name: 'Torneo Otoño 2026',
    year: 2026,
    type: 'FUTBOL 11',
    status: 'published',
    phases: ['Fase única']
  },
  {
    id: '6',
    name: 'Copa Primavera 2025',
    year: 2025,
    type: 'BABY',
    status: 'published',
    phases: ['Fase única']
  },
  {
    id: '7',
    name: 'Torneo Invierno 2026',
    year: 2026,
    type: 'FUTSAL',
    status: 'draft',
    phases: ['Apertura', 'Clausura']
  },
  {
    id: '8',
    name: 'Copa Femenina 2025',
    year: 2025,
    type: 'FEMENINO',
    status: 'published',
    phases: ['Fase única']
  }
]

const tournamentTypes = [
  { id: 'FUTSAL', name: 'FUTSAL' },
  { id: 'BABY', name: 'BABY' },
  { id: 'FUTBOL 11', name: 'FÚTBOL 11' },
  { id: 'FEMENINO', name: 'FEMENINO' }
]

export default function TorneosHome() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const availableYears = Array.from(
    new Set(mockTournaments.map((t) => t.year))
  ).sort((a, b) => b - a)

  const currentYear = new Date().getFullYear()
  const defaultYear = availableYears.includes(currentYear)
    ? currentYear
    : (availableYears[0] ?? null)

  const [selectedYear, setSelectedYear] = useState<number | null>(defaultYear)

  // Torneos que coinciden con año y búsqueda (sin filtro de tipo)
  const tournamentsByYearAndSearch = mockTournaments.filter((tournament) => {
    const matchesYear = !selectedYear || tournament.year === selectedYear
    const matchesSearch =
      !searchTerm ||
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesYear && matchesSearch
  })

  // Tipos que tienen al menos un torneo con los filtros actuales (año + búsqueda)
  const availableTypes = tournamentTypes.filter((type) =>
    tournamentsByYearAndSearch.some((t) => t.type === type.id)
  )

  // Limpiar selectedType si ya no hay torneos de ese tipo con los filtros actuales
  useEffect(() => {
    if (
      selectedType &&
      !tournamentsByYearAndSearch.some((t) => t.type === selectedType)
    ) {
      setSelectedType(null)
    }
  }, [selectedType, selectedYear, searchTerm])

  const filteredTournaments = tournamentsByYearAndSearch.filter(
    (tournament) => !selectedType || tournament.type === selectedType
  )

  const getTournamentCountByType = (typeId: string) => {
    return tournamentsByYearAndSearch.filter((t) => t.type === typeId).length
  }

  const handleTournamentClick = (tournamentId: string) => {
    navigate(`${rutasNavegacion.torneosInformacion}/${tournamentId}`)
  }

  return (
    <div className=''>
      {/* Green gradient from top */}
      {/* <div className='absolute top-0 left-0 w-full h-[65vh] bg-gradient-to-b from-green-500 via-green-400 to-transparent opacity-80' /> */}

      {/* Content */}
      <div className='relative z-10'>
        {/* <Header showBackButton backTo='/' title='Gestión de Torneos' /> */}

        <div className='max-w-7xl mx-auto px-6'>
          {/* Create Tournament Button */}
          <div className='mb-8'>
            <button
              onClick={() => navigate(rutasNavegacion.crearTorneo)}
              className='flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-lg font-semibold hover:scale-105 transform'
            >
              <Plus className='w-5 h-5' />
              Crear nuevo torneo
            </button>
          </div>

          {/* Filters */}
          <div className='bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-3xl p-6 mb-6 shadow-xl'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Year Filter Pills */}
              <div>
                {/* <label className='block text-gray-800 font-semibold mb-3 text-sm uppercase tracking-wide'>
                  Filtrar por Año
                </label> */}
                <div className='flex flex-wrap gap-2'>
                  <button
                    onClick={() => setSelectedYear(null)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedYear === null
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm text-gray-800 hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    Todos
                  </button>
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() =>
                        setSelectedYear(selectedYear === year ? null : year)
                      }
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        selectedYear === year
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-white/20 backdrop-blur-sm text-gray-800 hover:bg-white/30 border border-white/30'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div>
                {/* <label className='block text-gray-800 font-semibold mb-3 text-sm uppercase tracking-wide'>
                  Buscar por Nombre
                </label> */}
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500' />
                  <input
                    type='text'
                    placeholder='Buscar torneo por nombre...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:border-white/50 outline-none transition-all font-medium'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Types Pills - solo tipos con torneos que coinciden con año y búsqueda */}
          <div className='mb-8'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {availableTypes
                .filter((type) => !selectedType || type.id === selectedType)
                .map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      setSelectedType(selectedType === type.id ? null : type.id)
                    }
                    className={`relative bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-6 shadow-xl transition-all transform hover:scale-105 hover:bg-white/20 hover:border-white/40 ${
                      selectedType === type.id
                        ? 'bg-white/20 border-white/50 scale-105'
                        : ''
                    }`}
                  >
                    <div className='flex flex-col items-center text-center'>
                      <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 shadow-lg'>
                        <Trophy
                          className='w-8 h-8 text-gray-800'
                          strokeWidth={2.5}
                        />
                      </div>
                      <h3 className='text-lg font-bold text-gray-800 mb-1'>
                        {type.name}
                      </h3>
                      <p className='text-gray-700 text-sm'>
                        {getTournamentCountByType(type.id)} torneos
                      </p>
                    </div>
                    {selectedType === type.id && (
                      <div className='absolute top-3 right-3'>
                        <div className='w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md'>
                          <div className='w-3 h-3 bg-primary-foreground rounded-full' />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Tournaments List */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-gray-800 text-2xl font-bold'>
                {selectedType ? `Torneos de ${selectedType}` : 'Torneos'}
              </h2>
              <span className='text-gray-700 font-medium'>
                {filteredTournaments.length} torneo
                {filteredTournaments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredTournaments.length === 0 ? (
              <div className='bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-3xl p-12 text-center shadow-xl'>
                <Trophy className='w-16 h-16 text-gray-500 mx-auto mb-4' />
                <p className='text-gray-700 text-lg'>
                  No se encontraron torneos
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredTournaments.map((tournament) => {
                  return (
                    <button
                      key={tournament.id}
                      onClick={() => handleTournamentClick(tournament.id)}
                      className='relative bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-6 shadow-xl transition-all transform hover:scale-105 hover:bg-white/20 hover:border-white/40 text-left group'
                    >
                      {/* Status Badge */}
                      <div className='absolute top-4 right-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tournament.status === 'published'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {tournament.status === 'published'
                            ? 'Tiene fases publicadas'
                            : 'Borrador'}
                        </span>
                      </div>

                      {/* Type Badge */}
                      <div className='mb-4'>
                        <span className='inline-block px-3 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-sm text-gray-800 border border-white/30'>
                          {tournament.type}
                        </span>
                      </div>

                      {/* Tournament Name */}
                      <h3 className='text-xl font-bold text-gray-800 mb-2 group-hover:text-primary'>
                        {tournament.name}
                      </h3>

                      {/* Phases */}
                      {tournament.phases.length > 0 && (
                        <div className='flex items-center gap-2 text-gray-600 text-sm mb-2'>
                          <Layers className='w-4 h-4 shrink-0' />
                          <span>{tournament.phases.join(' · ')}</span>
                        </div>
                      )}

                      {/* Year */}
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Calendar className='w-4 h-4' />
                        <span className='font-medium'>{tournament.year}</span>
                      </div>

                      {/* Hover Arrow */}
                      <div className='absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md'>
                          <span className='text-primary-foreground font-bold'>
                            →
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
