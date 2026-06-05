import { api } from '@/api/api'
import { ArbitroDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InputTelefonoCelular from './components/input-telefono-celular'
import {
  extraerDigitosTelefonoCelular,
  filtrarDigitosTelefonoCelular,
  formatearTelefonoCelularParaBackend,
  validarDigitosTelefonoCelular
} from './utilidades-telefono-celular'

export default function EditarArbitro() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dni, setDni] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [apellido, setApellido] = useState<string>('')
  const [telefonoCelular, setTelefonoCelular] = useState<string>('')
  const [errorTelefono, setErrorTelefono] = useState<string>('')

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

  useEffect(() => {
    if (arbitro) {
      setDni(arbitro.dni || '')
      setNombre(arbitro.nombre || '')
      setApellido(arbitro.apellido || '')
      setTelefonoCelular(extraerDigitosTelefonoCelular(arbitro.telefonoCelular))
    }
  }, [arbitro])

  const telefonoBackend = formatearTelefonoCelularParaBackend(telefonoCelular)
  const telefonoInicial = extraerDigitosTelefonoCelular(
    arbitro?.telefonoCelular
  )
  const hayCambios =
    !!arbitro &&
    (dni !== arbitro.dni ||
      nombre !== arbitro.nombre ||
      apellido !== arbitro.apellido ||
      telefonoCelular !== telefonoInicial)

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
        telefonoCelular: telefonoBackend
      })
    )
    navigate(rutasNavegacion.arbitros)
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
        pathBotonVolver={rutasNavegacion.arbitros}
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
            <ContenedorBotones>
              <Boton
                type='submit'
                estaCargando={mutation.isPending}
                disabled={!arbitro || !hayCambios}
              >
                Guardar
              </Boton>
            </ContenedorBotones>
          </form>
        }
      />
    </ContenedorCargandoYError>
  )
}
