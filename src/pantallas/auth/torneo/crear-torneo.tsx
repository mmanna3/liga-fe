import { api } from '@/api/api'
import { TorneoCategoriaDTO, TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { Input } from '@/design-system/ykn-ui/input'
import { rutasNavegacion } from '@/ruteo/rutas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Categorias } from './crear-torneo/components/categorias'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import type { Categoria } from './crear-torneo/tipos'

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
    fn: async (datos: DatosFormulario) => {
      if (datos.agrupadorId == null) {
        throw new Error('El agrupador es requerido')
      }
      const torneo = await api.torneoPOST(
        new TorneoDTO({
          nombre: datos.nombre,
          anio: parseInt(datos.temporada, 10),
          torneoAgrupadorId: datos.agrupadorId
        })
      )
      const torneoId = torneo.id
      if (!torneoId) throw new Error('El torneo no devolvió ID')

      const categoriasValidas = datos.categorias.filter(
        (c) =>
          c.nombre.trim() !== '' &&
          c.anioDesde.trim() !== '' &&
          c.anioHasta.trim() !== ''
      )

      for (const cat of categoriasValidas) {
        await api.categoriasPOST(
          torneoId,
          new TorneoCategoriaDTO({
            nombre: cat.nombre.trim(),
            anioDesde: parseInt(cat.anioDesde, 10),
            anioHasta: parseInt(cat.anioHasta, 10)
          })
        )
      }
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
    <Card className='max-w-2xl mx-auto'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Crear nuevo torneo</CardTitle>
          <CardDescription>
            Completá los datos para crear un torneo
          </CardDescription>
        </div>
        <BotonVolver path={rutasNavegacion.torneos} texto='Volver a torneos' />
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((d) => mutacion.mutate(d))}
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
      </CardContent>
    </Card>
  )
}
