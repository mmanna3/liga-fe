import { useNavigate } from 'react-router-dom'
import { Boton } from './boton'
import Icono from '@/design-system/ykn-ui/icono'

interface Props {
  /** Ruta específica a la que navegar. Si no se provee, usa navigate(-1) */
  path?: string
  className?: string
  /** Texto a mostrar. Si se provee, muestra el texto en lugar del ícono. */
  texto?: string
  /** Si se proporciona, se llama antes de navegar. Si retorna true, se navega; si false, se cancela. */
  onBeforeNavigate?: () => boolean
}

const BotonVolver: React.FC<Props> = ({
  path,
  className,
  texto,
  onBeforeNavigate
}: Props) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onBeforeNavigate && !onBeforeNavigate()) return
    if (path) navigate(path)
    else navigate(-1)
  }

  if (texto) {
    return (
      <Boton
        variant='outline'
        type='button'
        className={className}
        onClick={handleClick}
      >
        {texto}
      </Boton>
    )
  }

  return (
    <Boton
      variant='ghost'
      size='icon'
      type='button'
      className={className}
      onClick={handleClick}
      aria-label='Volver'
    >
      <Icono nombre='Volver' className='h-5 w-5' />
    </Boton>
  )
}

export default BotonVolver
