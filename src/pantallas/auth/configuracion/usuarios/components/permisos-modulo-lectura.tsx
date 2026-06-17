import type { UsuarioAccesoModuloDTO } from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import { Label } from '@/design-system/base-ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import {
  ModuloSistema,
  NivelAcceso,
  MODULOS_SISTEMA,
  seleccionDesdeAccesos
} from '@/logica-compartida/permisos'

interface PermisosModuloLecturaProps {
  accesosModulo?: UsuarioAccesoModuloDTO[] | null
  esSuperAdministrador?: boolean
}

function etiquetaNivel(nivel: NivelAcceso | null) {
  if (nivel === NivelAcceso.ControlTotal) return 'Control total'
  if (nivel === NivelAcceso.Edicion) return 'Edición'
  return 'Sin acceso'
}

function badgeNivel(nivel: NivelAcceso | null) {
  const etiqueta = etiquetaNivel(nivel)
  if (nivel === NivelAcceso.ControlTotal) {
    return <Badge>{etiqueta}</Badge>
  }
  if (nivel === NivelAcceso.Edicion) {
    return <Badge variant='secondary'>{etiqueta}</Badge>
  }
  return (
    <Badge variant='outline' className='text-muted-foreground'>
      {etiqueta}
    </Badge>
  )
}

function seleccionParaLectura(
  accesosModulo: UsuarioAccesoModuloDTO[] | null | undefined,
  esSuperAdministrador: boolean
) {
  if (esSuperAdministrador) {
    return Object.fromEntries(
      MODULOS_SISTEMA.map(({ modulo }) => [modulo, NivelAcceso.ControlTotal])
    ) as Partial<Record<ModuloSistema, NivelAcceso | null>>
  }
  return seleccionDesdeAccesos(accesosModulo)
}

export default function PermisosModuloLectura({
  accesosModulo,
  esSuperAdministrador = false
}: PermisosModuloLecturaProps) {
  const valor = seleccionParaLectura(accesosModulo, esSuperAdministrador)

  return (
    <div className='space-y-3' data-testid='permisos-modulo-lectura'>
      <div>
        <h3 className='text-sm font-medium'>Permisos por módulo</h3>
        {esSuperAdministrador ? (
          <p className='text-sm text-muted-foreground'>
            El rol SuperAdministrador tiene acceso completo en todos los
            módulos.
          </p>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Para modificar los permisos, usá el botón de editar.
          </p>
        )}
      </div>
      <div className='rounded-lg border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left px-3 py-2 font-medium'>Módulo</th>
              <th className='text-left px-3 py-2 font-medium w-40'>Acceso</th>
            </tr>
          </thead>
          <tbody>
            {MODULOS_SISTEMA.map(({ modulo, etiqueta }) => {
              const nivel = valor[modulo] ?? null
              return (
                <tr key={modulo} className='border-t'>
                  <td className='px-3 py-2'>
                    <Label>{etiqueta}</Label>
                  </td>
                  <td className='px-3 py-2'>
                    {nivel === NivelAcceso.ControlTotal ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='inline-flex cursor-help'>
                            {badgeNivel(nivel)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Incluye eliminar registros
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      badgeNivel(nivel)
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
