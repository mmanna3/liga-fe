import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { TournamentWizardData, Category } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Step1InformationProps {
  data: TournamentWizardData
  updateData: (field: Partial<TournamentWizardData>) => void
}

export function Step1Information({ data, updateData }: Step1InformationProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  )

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      yearFrom: '',
      yearTo: ''
    }
    updateData({ categories: [...data.categories, newCategory] })
    setEditingCategoryId(newCategory.id)
  }

  const removeCategory = (id: string) => {
    updateData({ categories: data.categories.filter((c) => c.id !== id) })
    if (editingCategoryId === id) {
      setEditingCategoryId(null)
    }
  }

  const updateCategory = (id: string, field: Partial<Category>) => {
    updateData({
      categories: data.categories.map((c) =>
        c.id === id ? { ...c, ...field } : c
      )
    })
  }

  const handleCategoryClick = (id: string) => {
    setEditingCategoryId(id)
  }

  const handleCategorySave = () => {
    setEditingCategoryId(null)
  }

  const editingCategory = editingCategoryId
    ? data.categories.find((c) => c.id === editingCategoryId)
    : null

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div>
          <Label className='mb-1.5'>Nombre del torneo *</Label>
          <Input
            type='text'
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder='Ej: Torneo Clausura 2026'
          />
        </div>
        <div>
          <Label className='mb-1.5'>Temporada/Año *</Label>
          <Input
            type='number'
            value={data.season}
            onChange={(e) => updateData({ season: e.target.value })}
            placeholder='2026'
          />
        </div>
      </div>

      <div>
        <Label className='mb-2'>Tipo *</Label>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {['FUTSAL', 'BABY', 'FUTBOL 11', 'FEMENINO'].map((type) => (
            <Button
              key={type}
              type='button'
              variant={data.type === type ? 'default' : 'secondary'}
              onClick={() =>
                updateData({ type: type as TournamentWizardData['type'] })
              }
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className='mb-2'>Categorías *</Label>

        {data.categories.length > 0 &&
          data.categories.some((c) => c.name) && (
            <div className='flex flex-wrap gap-2 mb-3'>
              {data.categories
                .filter((c) => c.name)
                .map((category) => (
                  <Badge
                    key={category.id}
                    variant='secondary'
                    className='pl-3 pr-1.5 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 transition-colors'
                    onClick={() => handleCategoryClick(category.id)}
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

        {editingCategory && (
          <div className='p-3 bg-muted rounded-lg mb-2'>
            <div className='flex items-center gap-2'>
              <Input
                type='text'
                value={editingCategory.name}
                onChange={(e) =>
                  updateCategory(editingCategory.id, { name: e.target.value })
                }
                placeholder='Ej: +40, Sub 15, Mayores'
                className='flex-1'
                autoFocus
              />
              <Input
                type='text'
                value={editingCategory.yearFrom}
                onChange={(e) =>
                  updateCategory(editingCategory.id, {
                    yearFrom: e.target.value
                  })
                }
                placeholder='Desde'
                className='w-20 text-center'
              />
              <span className='text-muted-foreground'>-</span>
              <Input
                type='text'
                value={editingCategory.yearTo}
                onChange={(e) =>
                  updateCategory(editingCategory.id, {
                    yearTo: e.target.value
                  })
                }
                placeholder='Hasta'
                className='w-20 text-center'
              />
              <Button type='button' size='sm' onClick={handleCategorySave}>
                Guardar
              </Button>
            </div>
          </div>
        )}

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={addCategory}
          className='mt-2'
        >
          <Plus className='w-4 h-4' />
          Agregar
        </Button>
      </div>

      <div>
        <Label className='mb-2'>Formato *</Label>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {[
            { id: 'ANUAL', label: 'Apertura/Clausura' },
            { id: 'MUNDIAL', label: 'Mundial' },
            { id: 'RELAMPAGO', label: 'Eliminación directa' },
            { id: 'PERSONALIZADO', label: 'Personalizado' }
          ].map((format) => (
            <button
              key={format.id}
              type='button'
              onClick={() =>
                updateData({
                  format: format.id as TournamentWizardData['format']
                })
              }
              className={cn(
                'p-3 rounded-lg text-center transition-all border-2',
                data.format === format.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted border-transparent hover:border-border'
              )}
            >
              <p
                className={cn(
                  'text-xs font-medium leading-tight',
                  data.format === format.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {format.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
