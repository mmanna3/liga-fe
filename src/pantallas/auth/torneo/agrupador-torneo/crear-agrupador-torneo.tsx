import { api } from '@/api/api'
import { TorneoAgrupadorDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Switch } from '@/design-system/base-ui/switch'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CrearAgrupadorTorneo() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState<string>('')
  const [esVisibleEnApp, setVisibleEnApp] = useState<boolean>(true)

  const mutation = useApiMutation({
    fn: async (nuevoAgrupador: TorneoAgrupadorDTO) => {
      await api.torneoAgrupadorPOST(nuevoAgrupador)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.agrupadoresTorneo),
    mensajeDeExito: `Agrupador '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(
      new TorneoAgrupadorDTO({
        nombre,
        esVisibleEnApp,
        color: 'Negro'
      })
    )
  }

  return (
    <LayoutSegundoNivel
      titulo='Crear agrupador de torneos'
      pathBotonVolver={rutasNavegacion.agrupadoresTorneo}
      contenido={
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            titulo='Nombre'
            id='nombre'
            type='text'
            placeholder='Nombre del agrupador'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <div className='flex items-center justify-between space-x-2'>
            <div className='space-y-0.5'>
              <Label htmlFor='esVisibleEnApp'>Es visible en la app</Label>
              <p className='text-sm text-muted-foreground'>
                Si está activado, el agrupador se mostrará en la app (cuando
                tenga torneos).
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Switch
                    id='esVisibleEnApp'
                    checked={esVisibleEnApp}
                    onCheckedChange={setVisibleEnApp}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side='left'
                className='max-w-xs text-base px-4 py-3'
                sideOffset={8}
              >
                <p>
                  Mientras el agrupador no tenga torneos, no se mostrará en la
                  app.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <ContenedorBotones>
            <Boton type='submit' estaCargando={mutation.isPending}>
              Guardar
            </Boton>
          </ContenedorBotones>
        </form>
      }
      maxWidth='md'
    />
  )
}
