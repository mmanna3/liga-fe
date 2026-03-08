import { Badge } from '@/design-system/base-ui/badge'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { Categoria } from '../tipos'

interface CategoriasProps {
  valor: Categoria[]
  alCambiar: (categorias: Categoria[]) => void
  error?: string
  titulo?: string
}

export function Categorias({
  valor,
  alCambiar,
  error,
  titulo = 'Categorías *'
}: CategoriasProps) {
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<string | null>(
    null
  )

  const agregarCategoria = () => {
    const nuevaCategoria: Categoria = {
      id: Date.now().toString(),
      nombre: '',
      anioDesde: '',
      anioHasta: ''
    }
    // Quitar categorías vacías antes de agregar: evita errores de validación
    // cuando el usuario agrega otra sin haber completado la anterior
    const categoriasConNombre = valor.filter((c) => c.nombre.trim() !== '')
    alCambiar([...categoriasConNombre, nuevaCategoria])
    setEditandoCategoriaId(nuevaCategoria.id)
  }

  const quitarCategoria = (id: string) => {
    alCambiar(valor.filter((c) => c.id !== id))
    if (editandoCategoriaId === id) {
      setEditandoCategoriaId(null)
    }
  }

  const actualizarCategoria = (id: string, campo: Partial<Categoria>) => {
    alCambiar(valor.map((c) => (c.id === id ? { ...c, ...campo } : c)))
  }

  const alClickearCategoria = (id: string) => {
    setEditandoCategoriaId(id)
  }

  const alGuardarCategoria = () => {
    if (categoriaEditando && !categoriaEditando.nombre.trim()) {
      quitarCategoria(categoriaEditando.id)
    }
    setEditandoCategoriaId(null)
  }

  const categoriaEditando = editandoCategoriaId
    ? valor.find((c) => c.id === editandoCategoriaId)
    : null

  return (
    <div>
      <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>

      {valor.length > 0 && valor.some((c) => c.nombre) && (
        <div className='flex flex-wrap gap-2 mb-3'>
          {valor
            .filter((c) => c.nombre)
            .map((categoria) => (
              <Badge
                key={categoria.id}
                variant='secondary'
                className='bg-primary/10 text-primary border-primary/20 pl-3 pr-1.5 py-1.5 text-sm cursor-pointer hover:bg-primary/20 transition-colors'
                onClick={() => alClickearCategoria(categoria.id)}
              >
                {categoria.nombre}
                {(categoria.anioDesde || categoria.anioHasta) && (
                  <span className='ml-1'>
                    ({categoria.anioDesde || '—'}/{categoria.anioHasta || '—'})
                  </span>
                )}
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    quitarCategoria(categoria.id)
                  }}
                  className='ml-1.5 hover:bg-muted rounded-full p-0.5'
                >
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            ))}
        </div>
      )}

      {categoriaEditando && (
        <div className='p-3 bg-muted rounded-lg mb-2 max-w-2xl'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
            <Input
              type='text'
              value={categoriaEditando.nombre}
              onChange={(e) =>
                actualizarCategoria(categoriaEditando.id, {
                  nombre: e.target.value
                })
              }
              placeholder='Ej: +40, Sub 15, Mayores'
              className='flex-1 min-w-0'
              autoFocus
            />
            <div className='flex items-center gap-2 sm:shrink-0'>
              <Input
                type='text'
                value={categoriaEditando.anioDesde}
                onChange={(e) =>
                  actualizarCategoria(categoriaEditando.id, {
                    anioDesde: e.target.value
                  })
                }
                placeholder='Desde'
                className='w-20 text-center'
              />
              <span className='text-muted-foreground'>-</span>
              <Input
                type='text'
                value={categoriaEditando.anioHasta}
                onChange={(e) =>
                  actualizarCategoria(categoriaEditando.id, {
                    anioHasta: e.target.value
                  })
                }
                placeholder='Hasta'
                className='w-20 text-center'
              />
              <Boton type='button' size='sm' onClick={alGuardarCategoria}>
                Guardar
              </Boton>
            </div>
          </div>
        </div>
      )}

      <Boton
        type='button'
        variant='outline'
        size='sm'
        onClick={agregarCategoria}
        className='my-2'
      >
        <Plus className='w-3 h-3' />
        Agregar
      </Boton>
      {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
    </div>
  )
}
