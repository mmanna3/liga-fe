import {
  TipoDeFaseEnum,
  type FaseCategoriaDTO,
  type FaseDTO
} from '@/api/clients'
import { useToggleVisibilidadFaseEnApp } from '@/api/hooks/use-visibilidad-en-app'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import { BotonEliminar } from '@/design-system/ykn-ui/boton-eliminar'
import Icono from '@/design-system/ykn-ui/icono'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Categorias } from '../../../crear-torneo/components/categorias'
import { DatosFaseLectura } from '../../../crear-torneo/components/datos-fase-lectura'
import { TituloFase } from '../../../crear-torneo/components/titulo-fase'
import type { Categoria } from '../../../crear-torneo/tipos'
import {
  faseCategoriasDtoACategoria,
  OPCIONES_FORMATO,
  tipoDeFaseNombreDesdeEnum,
  type FaseEstado
} from '../../lib'
import { useFaseItem } from './use-fase-item'

interface FaseItemProps {
  torneoId: number
  nombreTorneo: string
  fase: FaseEstado
  faseIndex: number
  faseOriginal?: FaseDTO
  categoriasFase?: FaseCategoriaDTO[]
  onActualizar: (campo: string, valor: string) => void
  onEliminar: () => void
  /** Si se provee, se llama al hacer clic en el ícono de zonas (guarda antes de navegar). Recibe el index de la fase. */
  onIrAZonas?: (faseIndex: number) => void
  /** Muestra loading en el botón de zonas mientras se guarda */
  estaGuardando?: boolean
  /** Si true, no muestra borde superior ni padding extra (para uso dentro de Card) */
  enCard?: boolean
}

function categoriasCompletas(cats: Categoria[]): boolean {
  return cats.some(
    (c) =>
      c.nombre.trim() !== '' &&
      c.anioDesde.trim() !== '' &&
      c.anioHasta.trim() !== ''
  )
}

export function FaseItem({
  torneoId,
  nombreTorneo,
  fase,
  faseIndex,
  faseOriginal,
  categoriasFase = [],
  onActualizar,
  onEliminar,
  onIrAZonas,
  estaGuardando = false,
  enCard = false
}: FaseItemProps) {
  const navigate = useNavigate()
  const [editandoCategorias, setEditandoCategorias] = useState(false)
  const [categoriasEdicion, setCategoriasEdicion] = useState<Categoria[]>([])
  const [errorCategorias, setErrorCategorias] = useState<string | undefined>()

  const {
    cambiarNombreMutation,
    cambiarFormatoMutation,
    guardarCategoriasMutation
  } = useFaseItem({
    torneoId,
    faseOriginal
  })
  const toggleVisibilidadFaseMutation = useToggleVisibilidadFaseEnApp(
    torneoId,
    faseOriginal?.id,
    faseOriginal?.esVisibleEnApp
  )

  useEffect(() => {
    if (!editandoCategorias) {
      setCategoriasEdicion(faseCategoriasDtoACategoria(categoriasFase))
      setErrorCategorias(undefined)
    }
  }, [categoriasFase, editandoCategorias])

  const faseId = fase.id ?? 0
  const pathZonas = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`

  const esEliminacionDirecta =
    faseOriginal?.tipoDeFase === TipoDeFaseEnum._2 ||
    fase.formato === 'eliminacion-directa'
  const tieneZonas = (faseOriginal?.zonas?.length ?? 0) > 0
  /** Con zonas, el formato no se edita (en ED el backend a veces sigue marcando la fase como editable). */
  const formatoYLecturaZonas =
    !fase.sePuedeEditar || (esEliminacionDirecta && tieneZonas)

  const esVisibleFaseEnApp = faseOriginal?.esVisibleEnApp ?? true
  const puedeEditarCategorias = faseOriginal?.id != null && editandoCategorias

  const alternarEdicionCategorias = () => {
    if (editandoCategorias) {
      setCategoriasEdicion(faseCategoriasDtoACategoria(categoriasFase))
      setErrorCategorias(undefined)
      setEditandoCategorias(false)
      return
    }
    setEditandoCategorias(true)
  }

  const claseBotonAccion =
    'h-7 w-7 min-w-7 p-0 border-none shadow-none text-muted-foreground hover:text-foreground/80 hover:bg-muted/50'

  const botonEditarCategorias =
    faseOriginal?.id != null ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Boton
            type='button'
            variant='outline'
            className={
              editandoCategorias
                ? `${claseBotonAccion} bg-muted text-foreground hover:bg-muted hover:text-foreground`
                : claseBotonAccion
            }
            aria-label={
              editandoCategorias
                ? 'Cancelar edición de categorías'
                : 'Editar categorías'
            }
            aria-pressed={editandoCategorias}
            onClick={alternarEdicionCategorias}
          >
            <Icono nombre='Editar' className='h-4 w-4 shrink-0' />
          </Boton>
        </TooltipTrigger>
        <TooltipContent
          side='bottom'
          className='max-w-xs px-4 py-3'
          sideOffset={8}
        >
          <p>
            {editandoCategorias
              ? 'Cancelar edición de categorías'
              : 'Editar categorías'}
          </p>
        </TooltipContent>
      </Tooltip>
    ) : null

  const botonVisibilidadEnApp =
    faseOriginal?.id != null ? (
      <VisibleSoloParaAdmin>
        <Tooltip>
          <TooltipTrigger asChild>
            <Boton
              type='button'
              variant='outline'
              className={claseBotonAccion}
              estaCargando={toggleVisibilidadFaseMutation.isPending}
              aria-label={
                esVisibleFaseEnApp
                  ? 'Fase visible en la app'
                  : 'Fase no visible en la app'
              }
              onClick={() => toggleVisibilidadFaseMutation.mutate()}
            >
              <Icono
                nombre={esVisibleFaseEnApp ? 'Visible' : 'NoVisible'}
                className='h-4 w-4 shrink-0'
              />
            </Boton>
          </TooltipTrigger>
          <TooltipContent
            side='bottom'
            className='max-w-xs px-4 py-3'
            sideOffset={8}
          >
            <p>
              {esVisibleFaseEnApp
                ? 'La fase es visible en la app'
                : 'La fase no es visible en la app'}
            </p>
          </TooltipContent>
        </Tooltip>
      </VisibleSoloParaAdmin>
    ) : null

  const botonZonas = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Boton
          type='button'
          variant='outline'
          className={claseBotonAccion}
          estaCargando={estaGuardando}
          aria-label='Zonas de la fase'
          onClick={() =>
            onIrAZonas ? onIrAZonas(faseIndex) : navigate(pathZonas)
          }
        >
          <Icono nombre='Equipos' className='h-4 w-4 shrink-0' />
        </Boton>
      </TooltipTrigger>
      <TooltipContent
        side='bottom'
        className='max-w-xs px-4 py-3'
        sideOffset={8}
      >
        <p>Zonas de la fase</p>
      </TooltipContent>
    </Tooltip>
  )

  const guardarCategorias = () => {
    if (!categoriasCompletas(categoriasEdicion)) {
      setErrorCategorias('Agregá al menos una categoría completa')
      return
    }
    setErrorCategorias(undefined)
    guardarCategoriasMutation.mutate(categoriasEdicion, {
      onSuccess: () => setEditandoCategorias(false)
    })
  }

  return (
    <div className={enCard ? 'space-y-2' : 'space-y-2 pt-6 border-t'}>
      <div className='flex items-start justify-between gap-2'>
        <TituloFase
          numero={fase.numero}
          valor={fase.nombre}
          alCambiar={(v: string) => onActualizar('nombre', v)}
          alConfirmar={(v: string) => cambiarNombreMutation.mutate(v)}
          soloLectura={false}
        />
        <div className='flex gap-0 shrink-0'>
          {botonZonas}
          {botonEditarCategorias}
          {botonVisibilidadEnApp}
          <BotonEliminar
            titulo='Eliminar fase'
            subtitulo={`¿Estás seguro de que querés eliminar la fase "${fase.nombre}"?`}
            onEliminar={onEliminar}
            puedeEliminar={fase.sePuedeEditar}
            textoNoSePuedeEliminar='Esta fase no se puede eliminar. Para eliminarla, eliminá primero todas sus zonas.'
            compacto
            className={claseBotonAccion}
            tooltip='Eliminar fase'
          />
        </div>
      </div>

      {formatoYLecturaZonas ? (
        <DatosFaseLectura
          zonas={faseOriginal?.zonas ?? []}
          formato={
            faseOriginal?.tipoDeFaseNombre ??
            tipoDeFaseNombreDesdeEnum(faseOriginal?.tipoDeFase)
          }
          torneoId={torneoId}
          faseId={faseId}
          nombreTorneo={nombreTorneo}
          nombreFase={fase.nombre}
          categorias={categoriasFase}
        />
      ) : (
        <SelectorSimple
          titulo=''
          opciones={OPCIONES_FORMATO}
          valorActual={fase.formato}
          alElegirOpcion={(v) => {
            onActualizar('formato', v)
            cambiarFormatoMutation.mutate(v)
          }}
        />
      )}

      {faseOriginal?.id != null && (
        <div className='mt-2 border-t pt-2'>
          <Categorias
            titulo=''
            valor={categoriasEdicion}
            alCambiar={setCategoriasEdicion}
            soloLectura={!puedeEditarCategorias}
            error={errorCategorias}
          />
          {puedeEditarCategorias && (
            <div className='flex justify-end mt-2'>
              <Boton
                type='button'
                size='sm'
                estaCargando={guardarCategoriasMutation.isPending}
                onClick={guardarCategorias}
              >
                Guardar categorías
              </Boton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
