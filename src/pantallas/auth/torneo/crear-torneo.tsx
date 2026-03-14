import { api } from '@/api/api'
import {
  CrearTorneoDTO,
  TorneoCategoriaDTO,
  TorneoFaseDTO
} from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple, {
  type OpcionSelector
} from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Categorias } from './crear-torneo/components/categorias'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import { TituloFase } from './crear-torneo/components/titulo-fase'
import type { Categoria } from './crear-torneo/tipos'

const OPCIONES_FORMATO: OpcionSelector[] = [
  { id: 'todos-contra-todos', titulo: 'Todos contra todos' },
  { id: 'eliminacion-directa', titulo: 'Eliminación directa' }
]

const esquema = z
  .object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    temporada: z.string().min(1, 'La temporada es requerida'),
    agrupadorId: z.number().optional(),
    categorias: z
      .array(
        z.object({
          id: z.string(),
          nombre: z.string(),
          anioDesde: z.string(),
          anioHasta: z.string()
        })
      )
      .refine(
        (cats) =>
          cats.some(
            (c) =>
              c.nombre.trim() !== '' &&
              c.anioDesde.trim() !== '' &&
              c.anioHasta.trim() !== ''
          ),
        'Agregá al menos una categoría con nombre y años'
      )
  })
  .refine((data) => data.agrupadorId != null, {
    message: 'El agrupador es requerido',
    path: ['agrupadorId']
  })

type DatosFormulario = z.infer<typeof esquema>

const valoresIniciales: Partial<DatosFormulario> = {
  nombre: '',
  temporada: new Date().getFullYear().toString(),
  agrupadorId: undefined,
  categorias: []
}

export default function CrearTorneo() {
  const navigate = useNavigate()
  const [tituloFase, setTituloFase] = useState('Primera Fase')
  const [formatoFase, setFormatoFase] = useState('')

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: valoresIniciales as DatosFormulario
  })

  const mutacion = useApiMutation({
    fn: async (payload: {
      datos: DatosFormulario
      tituloFase: string
      formatoFase: string
    }) => {
      const { datos, tituloFase, formatoFase } = payload
      if (datos.agrupadorId == null) {
        throw new Error('El agrupador es requerido')
      }
      if (!tituloFase?.trim()) {
        throw new Error('El nombre de la fase es requerido')
      }
      if (!formatoFase) {
        throw new Error('Seleccioná el formato de la fase')
      }

      const categoriasValidas = datos.categorias
        .filter(
          (c) =>
            c.nombre.trim() !== '' &&
            c.anioDesde.trim() !== '' &&
            c.anioHasta.trim() !== ''
        )
        .map(
          (c) =>
            new TorneoCategoriaDTO({
              nombre: c.nombre.trim(),
              anioDesde: parseInt(c.anioDesde, 10),
              anioHasta: parseInt(c.anioHasta, 10)
            })
        )

      const faseFormatoId = formatoFase === 'todos-contra-todos' ? 1 : 2

      const primeraFase = new TorneoFaseDTO({
        numero: 1,
        nombre: tituloFase.trim(),
        faseFormatoId,
        estadoFaseId: 100,
        esVisibleEnApp: true
      })

      await api.torneoPOST(
        new CrearTorneoDTO({
          nombre: datos.nombre,
          anio: parseInt(datos.temporada, 10),
          torneoAgrupadorId: datos.agrupadorId,
          categorias: categoriasValidas,
          primeraFase
        })
      )
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: 'Torneo creado correctamente'
  })

  const datos = {
    nombre: watch('nombre'),
    temporada: watch('temporada'),
    agrupadorId: watch('agrupadorId'),
    categorias: watch('categorias')
  }

  return (
    <LayoutSegundoNivel
      titulo='Crear nuevo torneo'
      subtitulo='Completá los datos para crear un torneo'
      pathBotonVolver={rutasNavegacion.torneos}
      maxWidth='2xl'
      contenido={
        <form
          onSubmit={handleSubmit((d) =>
            mutacion.mutate({
              datos: d,
              tituloFase,
              formatoFase
            })
          )}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Input
              tipo='text'
              titulo='Nombre del torneo *'
              value={datos.nombre}
              onChange={(e) => setValue('nombre', e.target.value)}
              placeholder='Ej: Torneo Anual 2026'
              error={errors.nombre?.message}
            />
            <Input
              tipo='number'
              titulo='Temporada/Año *'
              value={datos.temporada}
              onChange={(e) => setValue('temporada', e.target.value)}
              placeholder='2026'
              error={errors.temporada?.message}
            />
          </div>

          <SelectorAgrupador
            valor={datos.agrupadorId ?? null}
            alCambiar={(id) =>
              setValue('agrupadorId', id != null ? id : undefined)
            }
            error={errors.agrupadorId?.message}
          />

          <Categorias
            valor={datos.categorias}
            alCambiar={(categorias: Categoria[]) =>
              setValue('categorias', categorias)
            }
            error={errors.categorias?.message}
          />

          <div className='space-y-4 pt-6 border-t'>
            <TituloFase valor={tituloFase} alCambiar={setTituloFase} />
            <SelectorSimple
              titulo='Formato'
              opciones={OPCIONES_FORMATO}
              valorActual={formatoFase}
              alElegirOpcion={setFormatoFase}
            />
          </div>

          <div className='flex justify-end pt-4 border-t'>
            <Boton
              type='submit'
              className='h-11 w-40 text-sm'
              estaCargando={mutacion.isPending}
            >
              Crear torneo
            </Boton>
          </div>
        </form>
      }
    />
  )
}
