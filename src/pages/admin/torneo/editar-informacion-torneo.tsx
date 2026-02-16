import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TituloDeInput from '@/components/ykn-ui/titulo-de-input'
import { rutasNavegacion } from '@/routes/rutas'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import {
  mockTournamentsDetail,
  type CategorySimple,
  type TournamentDetail
} from './data/mock-tournament-detail'
import {
  SelectorTipoTorneo,
  type TipoTorneo
} from './components/selector-tipo-torneo'

export default function EditarInformacionTorneoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const tournamentFromState = (
    location.state as { tournament?: TournamentDetail } | null
  )?.tournament
  const tournamentFromMock = mockTournamentsDetail.find((t) => t.id === id)
  const initial = tournamentFromState ?? tournamentFromMock ?? null

  const [name, setName] = useState(initial?.name ?? '')
  const [season, setSeason] = useState(initial?.season ?? '')
  const [type, setType] = useState<TipoTorneo>(initial?.type ?? 'FUTSAL')
  const [categories, setCategories] = useState<CategorySimple[]>(
    initial?.categories ?? []
  )
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  )

  const handleGuardar = () => {
    if (!initial) return
    const updated: TournamentDetail = {
      ...initial,
      name,
      season,
      type,
      year: parseInt(season) || initial.year,
      categories
    }
    navigate(`${rutasNavegacion.torneosInformacion}/${id}`, {
      state: { tournament: updated }
    })
  }

  const addCategory = () => {
    const newCategory: CategorySimple = {
      id: Date.now().toString(),
      name: '',
      yearFrom: '',
      yearTo: ''
    }
    const withNames = categories.filter((c) => c.name.trim())
    setCategories([...withNames, newCategory])
    setEditingCategoryId(newCategory.id)
  }

  const handleCategorySave = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    if (cat && !cat.name.trim()) {
      removeCategory(categoryId)
    }
    setEditingCategoryId(null)
  }

  const removeCategory = (categoryId: string) => {
    setCategories(categories.filter((c) => c.id !== categoryId))
  }

  const updateCategory = (
    categoryId: string,
    field: keyof CategorySimple,
    value: string
  ) => {
    setCategories(
      categories.map((c) =>
        c.id === categoryId ? { ...c, [field]: value } : c
      )
    )
  }

  if (!initial) {
    return (
      <div className='p-8 text-center'>
        <p className='text-muted-foreground'>Torneo no encontrado</p>
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => navigate(rutasNavegacion.torneosHome)}
        >
          Volver
        </Button>
      </div>
    )
  }

  const categoriesWithName = categories.filter((c) => c.name)

  return (
    <div className='space-y-6 max-w-2xl'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() =>
            navigate(`${rutasNavegacion.torneosInformacion}/${id}`, {
              state: { tournament: initial }
            })
          }
        >
          <ArrowLeft className='w-5 h-5' />
        </Button>
        <h1 className='text-2xl font-bold'>Editar torneo</h1>
      </div>

      <div className='space-y-4'>
        <div>
          <TituloDeInput className='mb-1'>Nombre del torneo *</TituloDeInput>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Ej: Torneo Anual 2026'
          />
        </div>
        <div>
          <TituloDeInput className='mb-1'>Temporada/Año *</TituloDeInput>
          <Input
            type='text'
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder='2026'
          />
        </div>

        <SelectorTipoTorneo valor={type} alCambiar={setType} />

        <div>
          <TituloDeInput className='mb-2'>Categorías</TituloDeInput>
          {categoriesWithName.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-3'>
              {categories
                .filter((c) => c.name && editingCategoryId !== c.id)
                .map((category) => (
                  <Badge
                    key={category.id}
                    variant='secondary'
                    className='bg-primary/10 text-primary border-primary/20 pl-3 pr-1.5 py-1.5 text-sm cursor-pointer hover:bg-primary/20 transition-colors'
                    onClick={() => setEditingCategoryId(category.id)}
                  >
                    {category.name}
                    {(category.yearFrom || category.yearTo) && (
                      <span className='ml-1'>
                        ({category.yearFrom || '—'}/{category.yearTo || '—'})
                      </span>
                    )}
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCategory(category.id)
                      }}
                      className='ml-1.5 hover:bg-muted rounded-full p-0.5'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
          {(editingCategoryId || categories.some((c) => !c.name)) && (
            <div className='p-3 bg-muted rounded-lg mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
              {(() => {
                const category = categories.find(
                  (c) => c.id === editingCategoryId || !c.name
                )
                if (!category) return null
                return (
                  <>
                    <Input
                      type='text'
                      value={category.name}
                      onChange={(e) =>
                        updateCategory(category.id, 'name', e.target.value)
                      }
                      placeholder='Ej: +40, Sub 15, Mayores'
                      className='flex-1 min-w-0'
                      autoFocus
                    />
                    <div className='flex items-center gap-2 sm:shrink-0'>
                      <Input
                        type='text'
                        value={category.yearFrom}
                        onChange={(e) =>
                          updateCategory(
                            category.id,
                            'yearFrom',
                            e.target.value
                          )
                        }
                        placeholder='Desde'
                        className='w-20 text-center'
                      />
                      <span className='text-muted-foreground'>-</span>
                      <Input
                        type='text'
                        value={category.yearTo}
                        onChange={(e) =>
                          updateCategory(category.id, 'yearTo', e.target.value)
                        }
                        placeholder='Hasta'
                        className='w-20 text-center'
                      />
                      <Button
                        type='button'
                        size='sm'
                        onClick={() => handleCategorySave(category.id)}
                      >
                        Guardar
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        onClick={() => {
                          if (!category.name.trim()) removeCategory(category.id)
                          setEditingCategoryId(null)
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addCategory}
            className='my-2'
          >
            <Plus className='w-3 h-3' />
            Agregar categoría
          </Button>
        </div>

        <div className='flex gap-2 pt-4'>
          <Button onClick={handleGuardar}>Guardar</Button>
          <Button
            variant='outline'
            onClick={() =>
              navigate(`${rutasNavegacion.torneosInformacion}/${id}`, {
                state: { tournament: initial }
              })
            }
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
