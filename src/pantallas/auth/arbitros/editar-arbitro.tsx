import { api } from '@/api/api'
import { ArbitroDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { BotonEliminar } from '@/design-system/ykn-ui/boton-eliminar'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CamposDatosAdicionalesArbitro from './components/campos-datos-adicionales-arbitro'
import InputTelefonoCelular from './components/input-telefono-celular'
import SelectorAgrupadoresMultiples from './components/selector-agrupadores-multiples'
import SelectorEquiposProhibidos from './components/selector-equipos-prohibidos'
import {
  datosAdicionalesDesdeArbitro,
  datosAdicionalesParaBackend,
  mismosDatosAdicionales,
  validarDatosAdicionales
} from './utilidades-datos-arbitro'
import {
  extraerDigitosTelefonoCelular,
  filtrarDigitosTelefonoCelular,
  formatearTelefonoCelularParaBackend,
  validarDigitosTelefonoCelular
} from './utilidades-telefono-celular'

function mismosIds(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const ordenadosA = [...a].sort((x, y) => x - y)
  const ordenadosB = [...b].sort((x, y) => x - y)
  return ordenadosA.every((id, i) => id === ordenadosB[i])
}

export default function EditarArbitro() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dni, setDni] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [apellido, setApellido] = useState<string>('')
  const [telefonoCelular, setTelefonoCelular] = useState<string>('')
  const [errorTelefono, setErrorTelefono] = useState<string>('')
  const [torneoAgrupadorIds, setTorneoAgrupadorIds] = useState<number[]>([])
  const [equipoProhibidoIds, setEquipoProhibidoIds] = useState<number[]>([])
  const [datosAdicionales, setDatosAdicionales] = useState(() =>
    datosAdicionalesDesdeArbitro(undefined)
  )
  const [errorInstitucion, setErrorInstitucion] = useState<string>()

  const {
    data: arbitro,
    isError,
    isLoading
  } = useApiQuery({
    key: ['arbitro', id],
    fn: async () => await api.arbitroGET(Number(id))
  })

  const mutation = useApiMutation({
    fn: async (arbitroActualizado: ArbitroDTO) => {
      await api.arbitroPUT(Number(id), arbitroActualizado)
    },
    antesDeMensajeExito: () => {
      // Con datos viejos en cache, guardar de nuevo pisaría lo recién editado.
      void queryClient.invalidateQueries({ queryKey: ['arbitro', id] })
      void queryClient.invalidateQueries({ queryKey: ['arbitros'] })
    },
    mensajeDeExito: 'Árbitro actualizado correctamente'
  })

  const eliminarMutation = useApiMutation({
    fn: async (arbitroId: number) => {
      await api.arbitroDELETE(arbitroId)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.datosArbitros),
    mensajeDeExito: `El árbitro '${arbitro?.nombre} ${arbitro?.apellido}' fue eliminado.`
  })

  useEffect(() => {
    if (arbitro) {
      setDni(arbitro.dni || '')
      setNombre(arbitro.nombre || '')
      setApellido(arbitro.apellido || '')
      setTelefonoCelular(extraerDigitosTelefonoCelular(arbitro.telefonoCelular))
      setTorneoAgrupadorIds(arbitro.torneoAgrupadorIds ?? [])
      setEquipoProhibidoIds(arbitro.equipoProhibidoIds ?? [])
      setDatosAdicionales(datosAdicionalesDesdeArbitro(arbitro))
    }
  }, [arbitro])

  const telefonoBackend = formatearTelefonoCelularParaBackend(telefonoCelular)
  const telefonoInicial = extraerDigitosTelefonoCelular(
    arbitro?.telefonoCelular
  )
  const agrupadoresIniciales = arbitro?.torneoAgrupadorIds ?? []
  const equiposProhibidosIniciales = arbitro?.equipoProhibidoIds ?? []
  const hayCambios =
    !!arbitro &&
    (dni !== arbitro.dni ||
      nombre !== arbitro.nombre ||
      apellido !== arbitro.apellido ||
      telefonoCelular !== telefonoInicial ||
      !mismosIds(torneoAgrupadorIds, agrupadoresIniciales) ||
      !mismosIds(equipoProhibidoIds, equiposProhibidosIniciales) ||
      !mismosDatosAdicionales(
        datosAdicionales,
        datosAdicionalesDesdeArbitro(arbitro)
      ))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!arbitro) return

    const errorValidacionTelefono =
      validarDigitosTelefonoCelular(telefonoCelular)
    if (errorValidacionTelefono) {
      setErrorTelefono(errorValidacionTelefono)
      return
    }

    if (!hayCambios) return
    setErrorTelefono('')

    const errorDatosAdicionales = validarDatosAdicionales(datosAdicionales)
    setErrorInstitucion(errorDatosAdicionales)
    if (errorDatosAdicionales) return

    await mutation.mutateAsync(
      new ArbitroDTO({
        id: arbitro.id,
        dni,
        nombre,
        apellido,
        telefonoCelular: telefonoBackend,
        ...datosAdicionalesParaBackend(datosAdicionales),
        torneoAgrupadorIds,
        equipoProhibidoIds
      })
    )
    navigate(rutasNavegacion.datosArbitros)
  }

  const handleTelefonoChange = (valor: string) => {
    const soloDigitos = filtrarDigitosTelefonoCelular(valor)
    setTelefonoCelular(soloDigitos)
    if (
      errorTelefono &&
      (soloDigitos.length === 0 || soloDigitos.length === 8)
    ) {
      setErrorTelefono('')
    }
  }

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del árbitro'
    >
      <LayoutSegundoNivel
        titulo='Editar árbitro'
        maxWidth='2xl'
        pathBotonVolver={rutasNavegacion.datosArbitros}
        contenido={
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              titulo='DNI'
              id='dni'
              type='number'
              icono='Carnet'
              placeholder='DNI'
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            <Input
              titulo='Nombre'
              id='nombre'
              type='text'
              icono='Usuario'
              placeholder='Nombre'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <Input
              titulo='Apellido'
              id='apellido'
              type='text'
              icono='Usuario'
              placeholder='Apellido'
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
            <InputTelefonoCelular
              valor={telefonoCelular}
              error={errorTelefono}
              onChange={handleTelefonoChange}
            />
            <CamposDatosAdicionalesArbitro
              valor={datosAdicionales}
              alCambiar={setDatosAdicionales}
              errorInstitucion={errorInstitucion}
            />
            <SelectorAgrupadoresMultiples
              valor={torneoAgrupadorIds}
              alCambiar={setTorneoAgrupadorIds}
            />
            <SelectorEquiposProhibidos
              valor={equipoProhibidoIds}
              equiposIniciales={arbitro?.equiposProhibidos}
              alCambiar={setEquipoProhibidoIds}
            />
            <div className='flex justify-between gap-2'>
              {arbitro && (
                <BotonEliminar
                  titulo='Eliminar árbitro'
                  subtitulo={`¿Confirmás que querés eliminar a ${arbitro.nombre} ${arbitro.apellido}? También se quitarán sus asignaciones a jornadas.`}
                  eliminarTexto='Eliminar árbitro'
                  onEliminar={() => eliminarMutation.mutate(arbitro.id!)}
                  estaCargando={eliminarMutation.isPending}
                  variant='texto-destructivo'
                />
              )}
              <Boton
                type='submit'
                estaCargando={mutation.isPending}
                disabled={!arbitro || !hayCambios}
              >
                Guardar
              </Boton>
            </div>
          </form>
        }
      />
    </ContenedorCargandoYError>
  )
}
