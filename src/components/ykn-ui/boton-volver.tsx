import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

interface Props {
  texto?: string
  path?: string
  /** Si se proporciona, se llama antes de navegar. Si retorna true, se navega; si false, se cancela. */
  onBeforeNavigate?: () => boolean
}

const BotonVolver: React.FC<Props> = ({
  texto = 'Volver',
  path,
  onBeforeNavigate
}: Props) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onBeforeNavigate && !onBeforeNavigate()) return
    if (path) navigate(path)
    else navigate(-1)
  }

  return (
    <Button variant='outline' type='button' onClick={handleClick}>
      {texto}
    </Button>
  )
}

export default BotonVolver
