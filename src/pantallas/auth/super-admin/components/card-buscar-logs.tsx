import { api } from '@/api/api'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { parsearErrores } from '../parsear-errores'
import MensajeResultadoAccion from './mensaje-resultado-accion'
import ResultadosLogs from './resultados-logs'

export default function CardBuscarLogs() {
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [dias, setDias] = useState(14)

  const { mutate, data, isPending, isError, error, reset, isSuccess } =
    useMutation({
      mutationFn: () => api.logsBuscar(textoBusqueda.trim(), dias, undefined)
    })

  const buscar = () => {
    reset()
    mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Icono nombre='Logs' className='h-8 w-8' />
          Buscar en logs
        </CardTitle>
        <CardDescription>
          Buscá un DNI o el texto JUGADOR_AUDIT. Las operaciones de
          eliminar/desvincular/pase se registran desde el deploy de esta
          instrumentación; casos anteriores no aparecen. También incluye errores
          de la app (nlog) y stdout de IIS.
        </CardDescription>
      </CardHeader>

      <div className='px-6 pb-6 flex flex-col gap-4'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='flex flex-col gap-1.5 min-w-[220px] flex-1'>
            <Label htmlFor='texto-logs'>Texto (mín. 3 caracteres)</Label>
            <Input
              id='texto-logs'
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              placeholder='Ej: 30111222'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textoBusqueda.trim().length >= 3) {
                  buscar()
                }
              }}
            />
          </div>
          <div className='flex flex-col gap-1.5 w-28'>
            <Label htmlFor='dias-logs'>Días</Label>
            <Input
              id='dias-logs'
              type='number'
              min={1}
              max={90}
              value={dias}
              onChange={(e) => setDias(Number(e.target.value) || 14)}
            />
          </div>
          <Boton
            onClick={buscar}
            disabled={isPending || textoBusqueda.trim().length < 3}
          >
            {isPending ? (
              <span className='flex items-center gap-2'>
                <Icono nombre='Cargando' className='h-4 w-4 animate-spin' />
                Buscando...
              </span>
            ) : (
              'Buscar'
            )}
          </Boton>
        </div>

        <MensajeResultadoAccion
          error={isError}
          tituloError='Error al buscar en los logs:'
          errores={parsearErrores(error)}
          errorObj={error}
        />

        {isSuccess && data && <ResultadosLogs resultado={data} />}
      </div>
    </Card>
  )
}
