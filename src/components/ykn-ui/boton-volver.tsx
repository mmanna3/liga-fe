import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { ArrowLeft } from 'lucide-react'

interface Props {
  /** Ruta específica a la que navegar. Si no se provee, usa navigate(-1) */
  path?: string
  className?: string
}

const BotonVolver: React.FC<Props> = ({ path, className }: Props) => {
  const navigate = useNavigate()

  return (
    <Button
      variant='ghost'
      size='icon'
      type='button'
      className={className}
      onClick={() => {
        if (path) navigate(path)
        else navigate(-1)
      }}
      aria-label='Volver'
    >
      <ArrowLeft className='h-5 w-5' />
    </Button>
  )
}

export default BotonVolver
