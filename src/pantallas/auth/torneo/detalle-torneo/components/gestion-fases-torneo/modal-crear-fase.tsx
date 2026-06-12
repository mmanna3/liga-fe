import {
  FaseCategoriaDTO,
  FaseDTO,
  TipoDeFaseEnum,
  type TorneoCategoriaDTO
} from '@/api/clients'
import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { useEffect, useState } from 'react'
import { Categorias } from '../../../crear-torneo/components/categorias'
import type { Categoria } from '../../../crear-torneo/tipos'
import {
  categoriasDtoACategoria,
  faseCategoriasACategoriaDto,
  OPCIONES_FORMATO
} from '../../lib'

interface ModalCrearFaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  torneoId: number
  categoriasPlantilla: TorneoCategoriaDTO[]
  maxNumeroFase: number
  alCrearExito: () => void
}

function categoriasCompletas(cats: Categoria[]): boolean {
  return cats.some(
    (c) =>
      c.nombre.trim() !== '' &&
      c.anioDesde.trim() !== '' &&
      c.anioHasta.trim() !== ''
  )
}

export function ModalCrearFase({
  open,
  onOpenChange,
  torneoId,
  categoriasPlantilla,
  maxNumeroFase,
  alCrearExito
}: ModalCrearFaseProps) {
  const [nombre, setNombre] = useState('Nueva fase')
  const [formato, setFormato] = useState('todos-contra-todos')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [errorCategorias, setErrorCategorias] = useState<string | undefined>()

  useEffect(() => {
    if (!open) return
    setNombre('Nueva fase')
    setFormato('todos-contra-todos')
    setCategorias(categoriasDtoACategoria(categoriasPlantilla))
    setErrorCategorias(undefined)
  }, [open, categoriasPlantilla])

  const crearMutation = useApiMutation<void>({
    fn: async () => {
      const categoriasDto = faseCategoriasACategoriaDto(categorias).map(
        (c) => new FaseCategoriaDTO({ ...c, id: undefined })
      )
      await api.fasesPOST(
        torneoId,
        new FaseDTO({
          numero: maxNumeroFase + 1,
          nombre: nombre.trim() || 'Nueva fase',
          tipoDeFase:
            formato === 'todos-contra-todos'
              ? TipoDeFaseEnum._1
              : TipoDeFaseEnum._2,
          estadoFaseId: 100,
          esVisibleEnApp: true,
          torneoId,
          categorias: categoriasDto
        })
      )
    },
    antesDeMensajeExito: () => {
      alCrearExito()
      onOpenChange(false)
    },
    mensajeDeExito: 'Fase creada'
  })

  const handleGuardar = () => {
    if (!categoriasCompletas(categorias)) {
      setErrorCategorias('Agregá al menos una categoría completa')
      return
    }
    setErrorCategorias(undefined)
    crearMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Nueva fase</DialogTitle>
          <DialogDescription>
            Configurá el nombre, formato y categorías de la fase. Las categorías
            se precargan desde la plantilla del torneo.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='nombre-nueva-fase'>Nombre</Label>
            <Input
              id='nombre-nueva-fase'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className='mt-1'
            />
          </div>

          <SelectorSimple
            titulo='Formato'
            opciones={OPCIONES_FORMATO}
            valorActual={formato}
            alElegirOpcion={setFormato}
          />

          <Categorias
            valor={categorias}
            alCambiar={setCategorias}
            error={errorCategorias}
          />
        </div>

        <DialogFooter>
          <Boton
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={crearMutation.isPending}
          >
            Cancelar
          </Boton>
          <Boton
            type='button'
            estaCargando={crearMutation.isPending}
            onClick={handleGuardar}
          >
            Crear fase
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
