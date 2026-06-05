import { api } from '@/api/api'
import { ArbitroDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputTelefonoCelular from './components/input-telefono-celular'
import {
  filtrarDigitosTelefonoCelular,
  formatearTelefonoCelularParaBackend,
  validarDigitosTelefonoCelular
} from './utilidades-telefono-celular'

export default function CrearArbitro() {
  const navigate = useNavigate()
  const [dni, setDni] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [apellido, setApellido] = useState<string>('')
  const [telefonoCelular, setTelefonoCelular] = useState<string>('')
  const [errorTelefono, setErrorTelefono] = useState<string>('')

  const mutation = useApiMutation({
    fn: async (nuevoArbitro: ArbitroDTO) => {
      await api.arbitroPOST(nuevoArbitro)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.arbitros),
    mensajeDeExito: `Árbitro '${nombre} ${apellido}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errorValidacionTelefono =
      validarDigitosTelefonoCelular(telefonoCelular)
    if (errorValidacionTelefono) {
      setErrorTelefono(errorValidacionTelefono)
      return
    }

    setErrorTelefono('')
    mutation.mutate(
      new ArbitroDTO({
        dni,
        nombre,
        apellido,
        telefonoCelular: formatearTelefonoCelularParaBackend(telefonoCelular)
      })
    )
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
    <LayoutSegundoNivel
      titulo='Agregar árbitro'
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
            <Boton type='submit' estaCargando={mutation.isPending}>
              Guardar
            </Boton>
          </ContenedorBotones>
        </form>
      }
    />
  )
}
