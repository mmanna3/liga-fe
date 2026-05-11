import { api } from '@/api/api'
import { CambiarEscudoDTO, ClubDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import Icono from '@/design-system/ykn-ui/icono'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CANCHA_TIPO_ID_POR_DEFECTO,
  OPCIONES_CANCHA_TIPO
} from './opciones-cancha-tipo'
import {
  CANCHA_SUPERFICIE_ID_POR_DEFECTO,
  OPCIONES_CANCHA_SUPERFICIE
} from './opciones-superficie-tipo'

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
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [canchaTipoId, setCanchaTipoId] = useState<number>(
    CANCHA_TIPO_ID_POR_DEFECTO
  )
  const [canchaSuperficieId, setCanchaSuperficieId] = useState<number>(
    CANCHA_SUPERFICIE_ID_POR_DEFECTO
  )
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
      setCanchaTipoId(club.canchaTipoId ?? CANCHA_TIPO_ID_POR_DEFECTO)
      setCanchaSuperficieId(
        club.canchaSuperficieId ?? CANCHA_SUPERFICIE_ID_POR_DEFECTO
      )
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
    const canchaTipoCambiada =
      canchaTipoId !== (club?.canchaTipoId ?? CANCHA_TIPO_ID_POR_DEFECTO)
    const canchaSuperficieCambiada =
      canchaSuperficieId !==
      (club?.canchaSuperficieId ?? CANCHA_SUPERFICIE_ID_POR_DEFECTO)
    const localidadCambiada = localidad !== (club?.localidad ?? '')
    const escudoCambiado = escudoBase64 !== null
    const datosCambiados =
      nombreCambiado ||
      direccionCambiada ||
      canchaTipoCambiada ||
      canchaSuperficieCambiada ||
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
            canchaTipoId,
            canchaSuperficieId,
            localidad: localidad || undefined
          })
        )
      }

      if (escudoCambiado && escudoBase64) {
        await cambiarEscudoMutation.mutateAsync(
          new CambiarEscudoDTO({ imagenBase64: escudoBase64 })
        )
      }

      await queryClient.invalidateQueries({ queryKey: ['club', id] })
      await queryClient.invalidateQueries({ queryKey: ['clubs'] })
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
    canchaTipoId !== (club?.canchaTipoId ?? CANCHA_TIPO_ID_POR_DEFECTO) ||
    canchaSuperficieId !==
      (club?.canchaSuperficieId ?? CANCHA_SUPERFICIE_ID_POR_DEFECTO) ||
    localidad !== (club?.localidad ?? '') ||
    escudoBase64 !== null

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del club'
    >
      <LayoutSegundoNivel
        titulo='Editar Club'
        pathBotonVolver={`${rutasNavegacion.detalleClub}/${id}`}
        maxWidth='2xl'
        contenido={
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Escudo + Nombre */}
            <div className='flex items-start gap-5'>
              <div className='shrink-0 pt-6'>
                <div className='h-24 w-24 rounded-xl border border-input bg-muted flex items-center justify-center overflow-hidden'>
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
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleSelectFile}
                  className='hidden'
                />
                <div className='flex gap-1 mt-2'>
                  <Boton
                    type='button'
                    variant='outline'
                    size='sm'
                    className='gap-1 flex-1 text-xs'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icono nombre='Subir' className='h-3 w-3' />
                    Cambiar
                  </Boton>
                  {escudoBase64 && (
                    <Boton
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-xs'
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

              <div className='flex-1'>
                <Input
                  titulo='Nombre'
                  id='nombre'
                  type='text'
                  placeholder='Nombre del club'
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Ubicación */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                titulo='Dirección'
                id='direccion'
                type='text'
                placeholder='Dirección'
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
              <Input
                titulo='Localidad'
                id='localidad'
                type='text'
                placeholder='Localidad'
                value={localidad}
                onChange={(e) => setLocalidad(e.target.value)}
              />
            </div>

            <SelectorSimple
              titulo='Cancha'
              opciones={OPCIONES_CANCHA_TIPO}
              valorActual={String(canchaTipoId)}
              alElegirOpcion={(id) => setCanchaTipoId(Number(id))}
            />

            <SelectorSimple
              titulo='Superficie'
              opciones={OPCIONES_CANCHA_SUPERFICIE}
              valorActual={String(canchaSuperficieId)}
              alElegirOpcion={(id) => setCanchaSuperficieId(Number(id))}
            />

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
        }
      />
    </ContenedorCargandoYError>
  )
}
