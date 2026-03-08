import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import { useState } from 'react'
import ModalSeleccionDelegados from './components/modal-seleccion-delegados'
import TablaDelegados from './components/tabla'

export default function Delegados() {
  const [modalSeleccionOpen, setModalSeleccionOpen] = useState(false)

  return (
    <>
      <FlujoHomeLayout
        titulo='Delegados'
        contenedorClassName='max-w-6xl'
        iconoTitulo={
          <Icono nombre='Delegados' className='h-8 w-8 text-primary' />
        }
        ocultarBotonVolver
        botonera={{
          iconos: [
            {
              alApretar: () => setModalSeleccionOpen(true),
              tooltip: 'Generar carnets PDF',
              icono: 'Descargar'
            }
          ]
        }}
        contenido={<TablaDelegados />}
      />
      <ModalSeleccionDelegados
        open={modalSeleccionOpen}
        onOpenChange={setModalSeleccionOpen}
      />
    </>
  )
}
