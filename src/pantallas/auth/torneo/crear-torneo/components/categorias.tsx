import { Badge } from '@/design-system/base-ui/badge'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { Categoria } from '../tipos'

const ANIO_ACTUAL = new Date().getFullYear()

interface CategoriasProps {
  valor: Categoria[]
  alCambiar: (categorias: Categoria[]) => void
  error?: string
  titulo?: string
  /** Si true, solo muestra las categorías sin posibilidad de editar/agregar/quitar */
  soloLectura?: boolean
}

export function Categorias({
  valor,
  alCambiar,
  error,
  titulo = 'Categorías',
  soloLectura = false
}: CategoriasProps) {
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<string | null>(
    null
  )
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([])

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
    setErroresValidacion([])
  }

  const quitarCategoria = (id: string) => {
    alCambiar(valor.filter((c) => c.id !== id))
    if (editandoCategoriaId === id) {
      setEditandoCategoriaId(null)
      setErroresValidacion([])
    }
  }

  const actualizarCategoria = (id: string, campo: Partial<Categoria>) => {
    alCambiar(valor.map((c) => (c.id === id ? { ...c, ...campo } : c)))
    if (id === editandoCategoriaId) {
      setErroresValidacion([])
    }
  }

  const soloAnio = (valor: string) => {
    const nums = valor.replace(/\D/g, '')
    if (nums.length <= 4) return nums
    return nums.slice(0, 4)
  }

  const alClickearCategoria = (id: string) => {
    setEditandoCategoriaId(id)
    setErroresValidacion([])
  }

  const alGuardarCategoria = () => {
    if (!categoriaEditando) return

    const errores: string[] = []

    if (!categoriaEditando.nombre.trim()) {
      errores.push('El nombre de la categoría es requerido')
    }

    const desde = categoriaEditando.anioDesde.trim()
    const hasta = categoriaEditando.anioHasta.trim()

    if (!desde) {
      errores.push('El año "Desde" es requerido')
    }
    if (!hasta) {
      errores.push('El año "Hasta" es requerido')
    }

    if (desde && hasta) {
      const desdeNum = parseInt(desde, 10)
      const hastaNum = parseInt(hasta, 10)
      if (desdeNum > hastaNum) {
        errores.push('"Desde" debe ser menor o igual que "Hasta"')
      }
      if (hastaNum > ANIO_ACTUAL) {
        errores.push('"Hasta" no puede ser mayor al año actual')
      }
    }

    if (errores.length > 0) {
      setErroresValidacion(errores)
      return
    }

    setErroresValidacion([])
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
                className={`bg-primary/10 text-primary border-primary/20 pl-3 pr-1.5 py-1.5 text-sm ${
                  soloLectura
                    ? ''
                    : 'cursor-pointer hover:bg-primary/20 transition-colors'
                }`}
                onClick={
                  soloLectura
                    ? undefined
                    : () => alClickearCategoria(categoria.id)
                }
              >
                {categoria.nombre}
                {(categoria.anioDesde || categoria.anioHasta) && (
                  <span className='ml-1'>
                    {categoria.anioDesde === categoria.anioHasta
                      ? `(${categoria.anioDesde || '—'})`
                      : `(${categoria.anioDesde || '—'}/${categoria.anioHasta || '—'})`}
                  </span>
                )}
                {!soloLectura && (
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
                )}
              </Badge>
            ))}
        </div>
      )}

      {!soloLectura && categoriaEditando && (
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
                type='number'
                inputMode='numeric'
                min={1900}
                max={ANIO_ACTUAL}
                step={1}
                value={categoriaEditando.anioDesde}
                onChange={(e) =>
                  actualizarCategoria(categoriaEditando.id, {
                    anioDesde: soloAnio(e.target.value)
                  })
                }
                placeholder='Desde'
                className='w-20 text-center'
              />
              <span className='text-muted-foreground'>-</span>
              <Input
                type='number'
                inputMode='numeric'
                min={1900}
                max={ANIO_ACTUAL}
                step={1}
                value={categoriaEditando.anioHasta}
                onChange={(e) =>
                  actualizarCategoria(categoriaEditando.id, {
                    anioHasta: soloAnio(e.target.value)
                  })
                }
                placeholder='Hasta'
                className='w-20 text-center'
              />
              <Boton type='button' size='sm' onClick={alGuardarCategoria}>
                Guardar
              </Boton>
              <button
                type='button'
                onClick={() => quitarCategoria(categoriaEditando.id)}
                className='p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors'
                title='Eliminar categoría'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
            {erroresValidacion.length > 0 && (
              <ul className='text-sm text-destructive mt-2 list-disc list-inside'>
                {erroresValidacion.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!soloLectura && (
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
      )}
      {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
    </div>
  )
}
