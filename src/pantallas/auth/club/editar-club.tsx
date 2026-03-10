import { api } from '@/api/api'
import { CambiarEscudoDTO, ClubDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Switch } from '@/design-system/base-ui/switch'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function extraerBase64(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    const base64Index = dataUrl.indexOf(',')
    return base64Index >= 0 ? dataUrl.slice(base64Index + 1) : dataUrl
  }
  return dataUrl
}

export default function EditarClub() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [esTechado, setEsTechado] = useState(false)
  const [localidad, setLocalidad] = useState('')
  const [escudoPreview, setEscudoPreview] = useState<string | null>(null)
  const [escudoBase64, setEscudoBase64] = useState<string | null>(null)

  const {
    data: club,
    isError,
    isLoading
  } = useApiQuery({
    key: ['club', id],
    fn: async () => await api.clubGET(Number(id))
  })

  const actualizarNombreMutation = useApiMutation({
    fn: async (clubActualizado: ClubDTO) => {
      await api.clubPUT(Number(id), clubActualizado)
    },
    mensajeDeExito: 'Club actualizado correctamente'
  })

  const cambiarEscudoMutation = useApiMutation({
    fn: async (dto: CambiarEscudoDTO) => {
      await api.cambiarEscudo(Number(id), dto)
    },
    mensajeDeExito: 'Escudo actualizado correctamente'
  })

  useEffect(() => {
    if (club) {
      setNombre(club.nombre || '')
      setDireccion(club.direccion || '')
      setEsTechado(club.esTechado ?? false)
      setLocalidad(club.localidad || '')
      if (club.escudo) {
        const src =
          club.escudo.startsWith('data:') || club.escudo.startsWith('http')
            ? club.escudo
            : `data:image/${club.escudo.startsWith('/9j/') ? 'jpeg' : 'png'};base64,${club.escudo}`
        setEscudoPreview(src)
      } else {
        setEscudoPreview(null)
      }
    }
  }, [club])

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        const result = reader.result as string
        setEscudoPreview(result)
        setEscudoBase64(extraerBase64(result))
      })
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nombreCambiado = nombre !== club?.nombre
    const direccionCambiada = direccion !== (club?.direccion ?? '')
    const esTechadoCambiado = esTechado !== (club?.esTechado ?? false)
    const localidadCambiada = localidad !== (club?.localidad ?? '')
    const escudoCambiado = escudoBase64 !== null
    const datosCambiados =
      nombreCambiado ||
      direccionCambiada ||
      esTechadoCambiado ||
      localidadCambiada

    if (!datosCambiados && !escudoCambiado) return

    try {
      if (datosCambiados) {
        await actualizarNombreMutation.mutateAsync(
          new ClubDTO({
            id: club?.id,
            nombre,
            escudo: club?.escudo,
            direccion: direccion || undefined,
            esTechado,
            localidad: localidad || undefined
          })
        )
      }

      if (escudoCambiado && escudoBase64) {
        await cambiarEscudoMutation.mutateAsync(
          new CambiarEscudoDTO({ imagenBase64: escudoBase64 })
        )
      }

      navigate(`${rutasNavegacion.detalleClub}/${id}`)
    } catch {
      // useApiMutation ya muestra el toast de error
    }
  }

  const isPending =
    actualizarNombreMutation.isPending || cambiarEscudoMutation.isPending
  const hayCambios =
    nombre !== club?.nombre ||
    direccion !== (club?.direccion ?? '') ||
    esTechado !== (club?.esTechado ?? false) ||
    localidad !== (club?.localidad ?? '') ||
    escudoBase64 !== null

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del club'
    >
      <div className='mb-4'>
        <BotonVolver path={`${rutasNavegacion.detalleClub}/${id}`} />
      </div>
      <Card className='max-w-md mx-auto p-4'>
        <CardHeader>
          <CardTitle>Editar Club</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='nombre'>Nombre</Label>
              <Input
                id='nombre'
                type='text'
                placeholder='Nombre del club'
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='direccion'>Dirección</Label>
              <Input
                id='direccion'
                type='text'
                placeholder='Dirección'
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='localidad'>Localidad</Label>
              <Input
                id='localidad'
                type='text'
                placeholder='Localidad'
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
              />
            </div>

            <div className='flex items-center justify-between space-x-2'>
              <Label htmlFor='esTechado'>¿Es techado?</Label>
              <Switch
                id='esTechado'
                checked={esTechado}
                onCheckedChange={setEsTechado}
                textoApagado='No'
                textoPrendido='Sí'
              />
            </div>

            <div className='space-y-2'>
              <Label>Escudo</Label>
              <div className='flex items-center gap-4'>
                <div className='h-24 w-24 rounded-lg border border-input bg-muted flex items-center justify-center overflow-hidden shrink-0'>
                  {escudoPreview ? (
                    <img
                      src={escudoPreview}
                      alt='Escudo del club'
                      className='h-full w-full object-contain'
                    />
                  ) : (
                    <Icono
                      nombre='Equipos'
                      className='h-12 w-12 text-muted-foreground'
                    />
                  )}
                </div>
                <div className='flex flex-col gap-2'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleSelectFile}
                    className='hidden'
                  />
                  <Boton
                    type='button'
                    variant='outline'
                    size='sm'
                    className='gap-2'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icono nombre='Subir' className='h-4 w-4' />
                    Cambiar escudo
                  </Boton>
                  {escudoBase64 && (
                    <Boton
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setEscudoBase64(null)
                        if (club?.escudo) {
                          const src =
                            club.escudo.startsWith('data:') ||
                            club.escudo.startsWith('http')
                              ? club.escudo
                              : `data:image/${club.escudo.startsWith('/9j/') ? 'jpeg' : 'png'};base64,${club.escudo}`
                          setEscudoPreview(src)
                        } else {
                          setEscudoPreview(null)
                        }
                      }}
                    >
                      Deshacer
                    </Boton>
                  )}
                </div>
              </div>
            </div>

            <ContenedorBotones>
              <Boton
                type='submit'
                estaCargando={isPending}
                disabled={!hayCambios}
              >
                Guardar
              </Boton>
            </ContenedorBotones>
          </form>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}
