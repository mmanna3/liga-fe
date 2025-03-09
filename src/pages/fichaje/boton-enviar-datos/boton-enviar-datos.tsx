import { Loader2 } from 'lucide-react'
import estilos from './PasoBotonEnviar.module.css'

interface Props {
  onEnviarClick: () => void
  estaCargando: boolean
}

const BotonEnviarDatos = ({ onEnviarClick, estaCargando }: Props) => {
  return (
    <div className={'bg-red-700 py-6 px-6'}>
      <div className={'flex '}>
        <div className=''>
          <div className={estilos.contenedorDeContenidoCentrado}>
            <p className={estilos.declaracion}>
              Al enviar los datos, declaro estar acompañado por un mayor de edad
              que autoriza a que puedan publicarse fotos y videos del jugador
              fichado en medios donde se difunda material sobre torneos
              organizados por la liga.
            </p>
          </div>

          <div className={estilos.contenedorDeContenidoCentrado}>
            <button
              disabled={estaCargando}
              className={`py-auto py-auto rounded-lg bg-green-700 cursor-pointer text-white ${estilos.boton}`}
              onClick={onEnviarClick}
            >
              {estaCargando ? (
                <div className='flex text-center ml-22'>
                  Enviando...
                  <Loader2 className='ml-4 mt-1 h-6 w-6 animate-spin' />
                </div>
              ) : (
                'ENVIAR MIS DATOS'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotonEnviarDatos
