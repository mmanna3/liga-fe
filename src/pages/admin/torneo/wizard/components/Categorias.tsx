import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TituloDeInput from '@/components/ykn-ui/titulo-de-input'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Category, TournamentWizardData } from '../types'

export function Categorias() {
  const { watch, setValue } = useFormContext<TournamentWizardData>()
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  )

  const categories = watch('categories')

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      yearFrom: '',
      yearTo: ''
    }
    // Quitar categorías vacías antes de agregar: evita errores de validación
    // cuando el usuario agrega otra sin haber completado la anterior
    const categoriesWithNames = categories.filter((c) => c.name.trim() !== '')
    setValue('categories', [...categoriesWithNames, newCategory])
    setEditingCategoryId(newCategory.id)
  }

  const removeCategory = (id: string) => {
    setValue(
      'categories',
      categories.filter((c) => c.id !== id)
    )
    if (editingCategoryId === id) {
      setEditingCategoryId(null)
    }
  }

  const updateCategory = (id: string, field: Partial<Category>) => {
    setValue(
      'categories',
      categories.map((c) => (c.id === id ? { ...c, ...field } : c))
    )
  }

  const handleCategoryClick = (id: string) => {
    setEditingCategoryId(id)
  }

  const handleCategorySave = () => {
    if (editingCategory && !editingCategory.name.trim()) {
      removeCategory(editingCategory.id)
    }
    setEditingCategoryId(null)
  }

  const editingCategory = editingCategoryId
    ? categories.find((c) => c.id === editingCategoryId)
    : null

  return (
    <div>
      <TituloDeInput>Categorías *</TituloDeInput>

      {categories.length > 0 && categories.some((c) => c.name) && (
        <div className='flex flex-wrap gap-2 mb-3'>
          {categories
            .filter((c) => c.name)
            .map((category) => (
              <Badge
                key={category.id}
                variant='secondary'
                className='bg-primary/10 text-primary border-primary/20 pl-3 pr-1.5 py-1.5 text-sm cursor-pointer hover:bg-primary/20 transition-colors'
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
        <div className='p-3 bg-muted rounded-lg mb-2 max-w-2xl'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
            <Input
              type='text'
              value={editingCategory.name}
              onChange={(e) =>
                updateCategory(editingCategory.id, { name: e.target.value })
              }
              placeholder='Ej: +40, Sub 15, Mayores'
              className='flex-1 min-w-0'
              autoFocus
            />
            <div className='flex items-center gap-2 sm:shrink-0'>
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
        Agregar
      </Button>
    </div>
  )
}
