import SelectorSimple from '@/components/ykn-ui/selector-simple'
import TituloDeInput from '@/components/ykn-ui/titulo-de-input'

export type TipoTorneo = 'FUTSAL' | 'BABY' | 'FUTBOL 11' | 'FEMENINO'

const OPCIONES_TIPO: { id: TipoTorneo; texto: string }[] = [
  { id: 'FUTSAL', texto: 'Futsal' },
  { id: 'BABY', texto: 'Baby' },
  { id: 'FUTBOL 11', texto: 'Fútbol 11' },
  { id: 'FEMENINO', texto: 'Femenino' }
]

interface SelectorTipoTorneoProps {
  valor: TipoTorneo | ''
  alCambiar: (tipo: TipoTorneo) => void
  titulo?: string
  error?: string
  deshabilitado?: boolean
}

export function SelectorTipoTorneo({
  valor,
  alCambiar,
  titulo = 'Tipo *',
  error,
  deshabilitado = false
}: SelectorTipoTorneoProps) {
  return (
    <div>
      <TituloDeInput>{titulo}</TituloDeInput>
      <SelectorSimple
        opciones={OPCIONES_TIPO}
        valorActual={valor}
        alElegirOpcion={(id) => alCambiar(id as TipoTorneo)}
        deshabilitado={deshabilitado}
      />
      {error && (
        <p className='text-sm text-destructive mt-2'>{error}</p>
      )}
    </div>
  )
}
