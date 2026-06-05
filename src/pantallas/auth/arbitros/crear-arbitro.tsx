import { api } from '@/api/api'
import { ArbitroDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import Icono from '@/design-system/ykn-ui/icono'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { cn } from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

    if (telefonoCelular.length > 0 && telefonoCelular.length !== 8) {
      setErrorTelefono('Ingresá exactamente 8 números')
      return
    }

    setErrorTelefono('')
    mutation.mutate(
      new ArbitroDTO({
        dni,
        nombre,
        apellido,
        telefonoCelular:
          telefonoCelular.length === 8 ? `+54911${telefonoCelular}` : undefined
      })
    )
  }

  const handleTelefonoChange = (valor: string) => {
    const soloDigitos = valor.replace(/\D/g, '').slice(0, 8)
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
          <div>
            <Label
              htmlFor='telefonoCelular'
              className='block mb-2 text-md font-semibold'
            >
              Teléfono celular
            </Label>
            <div
              className={cn(
                'flex h-11 w-full min-w-0 overflow-hidden rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                errorTelefono
                  ? 'border-destructive aria-invalid:ring-destructive/20'
                  : 'border-input'
              )}
            >
              <span className='flex items-center pl-3 pr-2 text-muted-foreground'>
                <Icono nombre='Teléfono' className='h-4 w-4 shrink-0' />
              </span>
              <span className='flex items-center border-r border-input bg-muted px-3 text-sm font-medium text-foreground select-none'>
                +54 9 11
              </span>
              <input
                id='telefonoCelular'
                type='text'
                inputMode='numeric'
                autoComplete='tel-national'
                placeholder='12345678'
                value={telefonoCelular}
                onChange={(e) => handleTelefonoChange(e.target.value)}
                maxLength={8}
                aria-invalid={!!errorTelefono}
                className='h-full min-w-0 flex-1 border-0 bg-transparent pl-2 pr-3 py-1 text-base outline-none md:text-sm placeholder:text-muted-foreground'
              />
            </div>
            {errorTelefono && (
              <p className='text-sm text-destructive mt-1'>{errorTelefono}</p>
            )}
          </div>
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
