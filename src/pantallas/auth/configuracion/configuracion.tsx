import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalDnisExpulsadosDeLaLiga from './modal-dnis-expulsados-de-la-liga'
import ModalEscudoPorDefecto from './modal-escudo-por-defecto'
import ModalHabilitacionFichaje from './modal-habilitacion-fichaje'

export default function Configuracion() {
  const navigate = useNavigate()
  const [modalFichajeAbierto, setModalFichajeAbierto] = useState(false)
  const [modalDnisExpulsadosAbierto, setModalDnisExpulsadosAbierto] =
    useState(false)
  const [modalEscudoPorDefectoAbierto, setModalEscudoPorDefectoAbierto] =
    useState(false)

  return (
    <FlujoHomeLayout
      titulo='Configuración'
      iconoTitulo='Configuracion'
      ocultarBotonVolver
      contenidoEnCard={false}
      contenido={
        <>
          <div className='grid grid-cols-2 gap-4 py-6'>
            <Card
              className='cursor-pointer transition-colors hover:bg-muted/50'
              role='button'
              tabIndex={0}
              onClick={() => setModalFichajeAbierto(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
              }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='Carnet' className='h-8 w-8' />
                  Habilitación de fichaje
                </CardTitle>
                <CardDescription>
                  Definí si el fichaje de jugadores y delegados en la app está
                  siempre disponible, deshabilitado o con horario automático.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className='cursor-pointer transition-colors hover:bg-muted/50'
              role='button'
              tabIndex={0}
              onClick={() => navigate(rutasNavegacion.generacionDeFixtures)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
              }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='Fixture' className='h-8 w-8' />
                  Generación de fixture
                </CardTitle>
                <CardDescription>
                  Gestioná algoritmos de generación de fixture para distintas
                  cantidades de equipos.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card
              className='cursor-pointer transition-colors hover:bg-muted/50'
              role='button'
              tabIndex={0}
              onClick={() => setModalDnisExpulsadosAbierto(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
              }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='DNIsExpulsados' className='h-8 w-8' />
                  DNIs expulsados de la liga
                </CardTitle>
                <CardDescription>
                  Gestioná los DNIs de jugadores y/o delegados que no pueden
                  volver a ficharse en la liga.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card
              className='cursor-pointer transition-colors hover:bg-muted/50'
              role='button'
              tabIndex={0}
              onClick={() => setModalEscudoPorDefectoAbierto(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
              }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='Equipos' className='h-8 w-8' />
                  Cambiar escudo por defecto
                </CardTitle>
                <CardDescription>
                  Elegí el escudo que se visualizará en Libre, Interzonal y
                  equipos sin escudo.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <ModalHabilitacionFichaje
            open={modalFichajeAbierto}
            onOpenChange={setModalFichajeAbierto}
          />
          <ModalDnisExpulsadosDeLaLiga
            open={modalDnisExpulsadosAbierto}
            onOpenChange={setModalDnisExpulsadosAbierto}
          />
          <ModalEscudoPorDefecto
            open={modalEscudoPorDefectoAbierto}
            onOpenChange={setModalEscudoPorDefectoAbierto}
          />
        </>
      }
    />
  )
}
