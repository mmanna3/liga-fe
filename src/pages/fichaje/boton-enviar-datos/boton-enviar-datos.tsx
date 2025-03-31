import estilos from './PasoBotonEnviar.module.css'

interface Props {
  onEnviarClick: () => void
  estaCargando: boolean
}

const BotonEnviarDatos = ({ onEnviarClick, estaCargando }: Props) => {
  return (
    <div className='bg-red-700 py-6 px-6 w-full'>
      <div className='max-w-[600px] mx-auto'>
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
            onClick={onEnviarClick}
            disabled={estaCargando}
            className='bg-green-700 text-white font-semibold py-6 px-12 rounded-xl'
            data-testid='boton-enviar-datos'
          >
            {estaCargando ? 'ENVIANDO...' : 'ENVIAR DATOS'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BotonEnviarDatos
