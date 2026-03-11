import { api } from '@/api/api'
import {
  CrearTorneoDTO,
  TorneoCategoriaDTO,
  TorneoFaseDTO
} from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Input as BaseInput } from '@/design-system/base-ui/input'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple, {
  type OpcionSelector
} from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Categorias } from './crear-torneo/components/categorias'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import type { Categoria } from './crear-torneo/tipos'

const OPCIONES_FORMATO: OpcionSelector[] = [
  { id: 'todos-contra-todos', titulo: 'Todos contra todos' },
  { id: 'eliminacion-directa', titulo: 'Eliminación directa' }
]

const OPCIONES_EXCLUYENTE: OpcionSelector[] = [
  {
    id: 'excluyente',
    titulo: 'Fase excluyente',
    descripcion:
      'Los equipos que juegan esta fase no pueden jugar otra fase excluyente.'
  },
  {
    id: 'no-excluyente',
    titulo: 'Fase no excluyente',
    descripcion: 'Cualquier equipo de la liga puede jugar esta fase.'
  }
]

function TituloEditable({
  valor,
  alCambiar,
  className
}: {
  valor: string
  alCambiar: (v: string) => void
  className?: string
}) {
  const [esEdicion, setEsEdicion] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (esEdicion && inputRef.current) {
      inputRef.current.focus()
    }
  }, [esEdicion])

  if (!esEdicion) {
    return (
      <div
        className={`flex items-center gap-1.5 group cursor-pointer ${className ?? ''}`}
        onClick={() => setEsEdicion(true)}
      >
        <h3 className='text-lg font-semibold group-hover:text-primary'>
          {valor || 'Primera Fase'}
        </h3>
        <Icono
          nombre='Editar'
          className='w-4 h-4 text-muted-foreground group-hover:text-primary'
        />
      </div>
    )
  }

  return (
    <BaseInput
      ref={(el) => {
        inputRef.current = el
        if (el) el.focus()
      }}
      className='text-lg font-semibold max-w-xs'
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      onBlur={() => setEsEdicion(false)}
    />
  )
}

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
  const [excluyenteFase, setExcluyenteFase] = useState('')

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
      formatoFase: string
      excluyenteFase: string
    }) => {
      const { datos, formatoFase, excluyenteFase } = payload
      if (datos.agrupadorId == null) {
        throw new Error('El agrupador es requerido')
      }
      if (!formatoFase || !excluyenteFase) {
        throw new Error('Seleccioná el formato y si la fase es excluyente')
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
      const esExcluyente = excluyenteFase === 'excluyente'

      const primeraFase = new TorneoFaseDTO({
        numero: 1,
        faseFormatoId,
        esExcluyente,
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
              formatoFase,
              excluyenteFase
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
            <TituloEditable valor={tituloFase} alCambiar={setTituloFase} />
            <SelectorSimple
              titulo='Formato'
              opciones={OPCIONES_FORMATO}
              valorActual={formatoFase}
              alElegirOpcion={setFormatoFase}
            />
            <SelectorSimple
              titulo='Excluyente'
              opciones={OPCIONES_EXCLUYENTE}
              valorActual={excluyenteFase}
              alElegirOpcion={setExcluyenteFase}
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
