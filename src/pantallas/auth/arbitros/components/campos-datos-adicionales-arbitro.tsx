import { Label } from '@/design-system/base-ui/label'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import {
  FRANJAS_HORARIAS,
  TEXTOS_FRANJA_HORARIA,
  TEXTOS_TIPO_MOVILIDAD,
  TIPOS_MOVILIDAD,
  type DatosAdicionalesArbitro
} from '../utilidades-datos-arbitro'

interface CamposDatosAdicionalesArbitroProps {
  valor: DatosAdicionalesArbitro
  alCambiar: (valor: DatosAdicionalesArbitro) => void
  errorInstitucion?: string
}

const OPCIONES_MOVILIDAD = TIPOS_MOVILIDAD.map((tipo) => ({
  id: String(tipo),
  titulo: TEXTOS_TIPO_MOVILIDAD[tipo]
}))

const OPCIONES_RELACION_INSTITUCIONAL = [
  { id: 'si', titulo: 'Sí' },
  { id: 'no', titulo: 'No' }
]

export default function CamposDatosAdicionalesArbitro({
  valor,
  alCambiar,
  errorInstitucion
}: CamposDatosAdicionalesArbitroProps) {
  const cambiar = (cambios: Partial<DatosAdicionalesArbitro>) =>
    alCambiar({ ...valor, ...cambios })

  const toggleFranja = (
    franja: DatosAdicionalesArbitro['franjasHorarias'][number],
    checked: boolean
  ) =>
    cambiar({
      franjasHorarias: checked
        ? [...valor.franjasHorarias, franja]
        : valor.franjasHorarias.filter((f) => f !== franja)
    })

  const relacionActual =
    valor.tieneRelacionInstitucional == null
      ? ''
      : valor.tieneRelacionInstitucional
        ? 'si'
        : 'no'

  return (
    <div className='space-y-4' data-testid='campos-datos-adicionales-arbitro'>
      <Input
        titulo='Dirección'
        id='direccion'
        type='text'
        placeholder='Dirección'
        maxLength={150}
        value={valor.direccion}
        onChange={(e) => cambiar({ direccion: e.target.value })}
      />
      <Input
        titulo='Localidad'
        id='localidad'
        type='text'
        placeholder='Localidad'
        maxLength={100}
        value={valor.localidad}
        onChange={(e) => cambiar({ localidad: e.target.value })}
      />
      <Input
        titulo='Fecha de nacimiento'
        id='fecha-nacimiento'
        type='date'
        value={valor.fechaNacimiento}
        onChange={(e) => cambiar({ fechaNacimiento: e.target.value })}
      />
      <div>
        <SelectorSimple
          titulo='Movilidad'
          opciones={OPCIONES_MOVILIDAD}
          valorActual={
            valor.tipoMovilidad != null ? String(valor.tipoMovilidad) : ''
          }
          alElegirOpcion={(id) =>
            cambiar({
              tipoMovilidad:
                id === String(valor.tipoMovilidad) ? undefined : Number(id)
            })
          }
        />
        <p className='mt-1 text-xs text-muted-foreground'>
          Tocá la opción elegida para dejarla sin dato.
        </p>
      </div>
      <div>
        <Label className='block mb-2 text-md font-semibold'>
          Franjas horarias
        </Label>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
          {FRANJAS_HORARIAS.map((franja) => (
            <CajitaConTick
              key={franja}
              id={`franja-${franja}`}
              checked={valor.franjasHorarias.includes(franja)}
              onCheckedChange={(checked) => toggleFranja(franja, checked)}
              label={TEXTOS_FRANJA_HORARIA[franja]}
            />
          ))}
        </div>
      </div>
      <SelectorSimple
        titulo='¿Tiene relación con alguna institución?'
        opciones={OPCIONES_RELACION_INSTITUCIONAL}
        valorActual={relacionActual}
        alElegirOpcion={(id) =>
          cambiar({
            tieneRelacionInstitucional:
              id === relacionActual ? undefined : id === 'si'
          })
        }
      />
      {valor.tieneRelacionInstitucional && (
        <Input
          titulo='Institución'
          id='institucion'
          type='text'
          placeholder='Institución'
          maxLength={100}
          value={valor.institucion}
          error={errorInstitucion}
          onChange={(e) => cambiar({ institucion: e.target.value })}
        />
      )}
    </div>
  )
}
