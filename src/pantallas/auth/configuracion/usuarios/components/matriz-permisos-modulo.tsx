import {
  ModuloSistema,
  NivelAcceso,
  MODULOS_SISTEMA,
  aDtoAccesosModulo
} from '@/logica-compartida/permisos'
import { Label } from '@/design-system/base-ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'

type SeleccionPermisos = Partial<Record<ModuloSistema, NivelAcceso | null>>

interface MatrizPermisosModuloProps {
  valor: SeleccionPermisos
  onChange: (valor: SeleccionPermisos) => void
}

function testIdModulo(modulo: ModuloSistema) {
  return MODULOS_SISTEMA.find((m) => m.modulo === modulo)
    ?.etiqueta.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

export default function MatrizPermisosModulo({
  valor,
  onChange
}: MatrizPermisosModuloProps) {
  const elegir = (modulo: ModuloSistema, nivel: NivelAcceso | null) => {
    onChange({ ...valor, [modulo]: nivel })
  }

  return (
    <div className='space-y-3' data-testid='matriz-permisos-modulo'>
      <div>
        <h3 className='text-sm font-medium'>Permisos por módulo</h3>
        <p className='text-sm text-muted-foreground'>
          Elegí qué secciones puede usar este usuario.
        </p>
      </div>
      <div className='rounded-lg border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left px-3 py-2 font-medium'>Módulo</th>
              <th className='text-center px-2 py-2 font-medium w-24'>
                Sin acceso
              </th>
              <th className='text-center px-2 py-2 font-medium w-24'>
                Edición
              </th>
              <th className='text-center px-2 py-2 font-medium w-32'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-help border-b border-dotted border-muted-foreground'>
                      Control total
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Incluye eliminar registros</TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {MODULOS_SISTEMA.map(({ modulo, etiqueta }) => {
              const seleccionado = valor[modulo] ?? null
              const idBase = testIdModulo(modulo)
              return (
                <tr
                  key={modulo}
                  className='border-t'
                  data-testid={`fila-modulo-${idBase}`}
                >
                  <td className='px-3 py-2'>
                    <Label>{etiqueta}</Label>
                  </td>
                  {(
                    [
                      { nivel: null, label: 'sin-acceso' },
                      { nivel: NivelAcceso.Edicion, label: 'edicion' },
                      {
                        nivel: NivelAcceso.ControlTotal,
                        label: 'control-total'
                      }
                    ] as const
                  ).map(({ nivel, label }) => (
                    <td key={label} className='text-center px-2 py-2'>
                      <input
                        type='radio'
                        name={`permiso-modulo-${modulo}`}
                        checked={seleccionado === nivel}
                        onChange={() => elegir(modulo, nivel)}
                        data-testid={`permiso-${idBase}-${label}`}
                        className='size-4 accent-primary'
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function accesosDesdeSeleccion(valor: SeleccionPermisos) {
  return aDtoAccesosModulo(valor)
}

export type { SeleccionPermisos }
