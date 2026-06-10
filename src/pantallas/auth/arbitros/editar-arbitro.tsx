import { api } from '@/api/api'
import { ArbitroDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InputTelefonoCelular from './components/input-telefono-celular'
import SelectorAgrupadoresMultiples from './components/selector-agrupadores-multiples'
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
  const [dni, setDni] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [apellido, setApellido] = useState<string>('')
  const [telefonoCelular, setTelefonoCelular] = useState<string>('')
  const [errorTelefono, setErrorTelefono] = useState<string>('')
  const [torneoAgrupadorIds, setTorneoAgrupadorIds] = useState<number[]>([])

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
    }
  }, [arbitro])

  const telefonoBackend = formatearTelefonoCelularParaBackend(telefonoCelular)
  const telefonoInicial = extraerDigitosTelefonoCelular(
    arbitro?.telefonoCelular
  )
  const agrupadoresIniciales = arbitro?.torneoAgrupadorIds ?? []
  const hayCambios =
    !!arbitro &&
    (dni !== arbitro.dni ||
      nombre !== arbitro.nombre ||
      apellido !== arbitro.apellido ||
      telefonoCelular !== telefonoInicial ||
      !mismosIds(torneoAgrupadorIds, agrupadoresIniciales))

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
    await mutation.mutateAsync(
      new ArbitroDTO({
        id: arbitro.id,
        dni,
        nombre,
        apellido,
        telefonoCelular: telefonoBackend,
        torneoAgrupadorIds
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
            <SelectorAgrupadoresMultiples
              valor={torneoAgrupadorIds}
              alCambiar={setTorneoAgrupadorIds}
            />
            <div className='flex justify-between gap-2'>
              {arbitro && (
                <ModalEliminacion
                  titulo='Eliminar árbitro'
                  subtitulo={`¿Confirmás que querés eliminar a ${arbitro.nombre} ${arbitro.apellido}? También se quitarán sus asignaciones a jornadas.`}
                  eliminarOnClick={() => eliminarMutation.mutate(arbitro.id!)}
                  eliminarTexto='Eliminar árbitro'
                  estaCargando={eliminarMutation.isPending}
                  trigger={
                    <Boton
                      type='button'
                      variant='outline'
                      className='border-destructive text-destructive hover:bg-destructive/10'
                      disabled={eliminarMutation.isPending}
                    >
                      Eliminar
                    </Boton>
                  }
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
