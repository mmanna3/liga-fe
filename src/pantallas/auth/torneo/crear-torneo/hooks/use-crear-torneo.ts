import {
  CrearTorneoDTO,
  TorneoCategoriaDTO,
  TorneoFaseDTO,
  TipoDeFaseEnum
} from '@/api/clients'
import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { rutasNavegacion } from '@/ruteo/rutas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { OpcionSelector } from '@/design-system/ykn-ui/selector-simple'

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

export type DatosFormulario = z.infer<typeof esquema>

const valoresIniciales: Partial<DatosFormulario> = {
  nombre: '',
  temporada: new Date().getFullYear().toString(),
  agrupadorId: undefined,
  categorias: []
}

export function useCrearTorneo() {
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

      const tipoDeFase =
        formatoFase === 'todos-contra-todos'
          ? TipoDeFaseEnum._1
          : TipoDeFaseEnum._2

      const primeraFase = new TorneoFaseDTO({
        numero: 1,
        nombre: tituloFase.trim(),
        tipoDeFase,
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

  return {
    handleSubmit,
    setValue,
    errors,
    mutacion,
    datos,
    tituloFase,
    setTituloFase,
    formatoFase,
    setFormatoFase,
    OPCIONES_FORMATO
  }
}
