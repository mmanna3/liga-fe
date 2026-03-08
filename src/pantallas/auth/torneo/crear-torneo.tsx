import { api } from '@/api/api'
import { TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Button } from '@/design-system/base-ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { IndicadorDePasos } from './crear-torneo/components/indicador-de-pasos'
import { Paso1Informacion } from './crear-torneo/components/paso-1-informacion'
import { Paso2Fases } from './crear-torneo/components/paso-2-fases'
import { Paso3Equipos } from './crear-torneo/components/paso-3-equipos'
import { Paso4Zonas } from './crear-torneo/components/paso-4-zonas'
import { Paso5Fixture } from './crear-torneo/components/paso-5-fixture'
import ModalCambiosDetectadosEnEdicion from './crear-torneo/components/ModalCambiosDetectadosEnEdicion'
import { Paso6Resumen } from './crear-torneo/components/paso-6-resumen'
import {
  esquemaPaso1,
  esquemaPaso2,
  esquemaPaso3,
  esquemaPaso4,
  esquemaPaso5,
  esquemaTorneo
} from './crear-torneo/esquema-validacion'
import type { DatosWizardTorneo } from './crear-torneo/tipos'
import { useStoreWizard } from './crear-torneo/use-store-wizard'

const datosIniciales: DatosWizardTorneo = {
  nombre: '',
  temporada: new Date().getFullYear().toString(),
  tipo: '',
  categorias: [],
  formato: '',
  fases: [],
  sumarPuntosAnuales: false,
  indiceFaseActual: 0,
  cantidadEquipos: 16,
  equiposSeleccionados: [],
  modoBusqueda: 'name',
  filtroAnio: '',
  filtroTipo: '',
  filtroTorneo: '',
  filtroFase: '',
  filtroZona: '',
  zonas: [],
  cantidadZonas: 1,
  prevenirMismoClub: false,
  fechasLibres: 0,
  fechasInterzonales: 0,
  fixtureGenerado: false,
  prevenirChoquesDeClub: false,
  estado: 'draft'
}

/** Extrae los datos relevantes de un paso para comparación/snapshot */
function obtenerDatosDePaso(datos: DatosWizardTorneo, paso: number): unknown {
  switch (paso) {
    case 1:
      return {
        nombre: datos.nombre,
        temporada: datos.temporada,
        tipo: datos.tipo,
        categorias: datos.categorias,
        formato: datos.formato
      }
    case 2:
      return { fases: datos.fases }
    case 3:
      return {
        cantidadEquipos: datos.cantidadEquipos,
        equiposSeleccionados: datos.equiposSeleccionados,
        modoBusqueda: datos.modoBusqueda,
        filtroAnio: datos.filtroAnio,
        filtroTipo: datos.filtroTipo,
        filtroTorneo: datos.filtroTorneo,
        filtroFase: datos.filtroFase,
        filtroZona: datos.filtroZona
      }
    case 4:
      return { zonas: datos.zonas, prevenirMismoClub: datos.prevenirMismoClub }
    case 5:
      return {
        fechasLibres: datos.fechasLibres,
        fechasInterzonales: datos.fechasInterzonales,
        fixtureGenerado: datos.fixtureGenerado,
        prevenirChoquesDeClub: datos.prevenirChoquesDeClub
      }
    default:
      return null
  }
}

/** Valores por defecto para limpiar los pasos posteriores a `paso` */
function obtenerDefaultsDespuesDePaso(
  paso: number
): Partial<DatosWizardTorneo> {
  const base = {
    indiceFaseActual: 0,
    cantidadEquipos: 16,
    equiposSeleccionados: [] as DatosWizardTorneo['equiposSeleccionados'],
    modoBusqueda: 'name' as const,
    filtroAnio: '',
    filtroTipo: '',
    filtroTorneo: '',
    filtroFase: '',
    filtroZona: '',
    zonas: [] as DatosWizardTorneo['zonas'],
    cantidadZonas: 1,
    prevenirMismoClub: false,
    fechasLibres: 0,
    fechasInterzonales: 0,
    fixtureGenerado: false,
    prevenirChoquesDeClub: false
  }
  if (paso <= 1) return { ...base, fases: [] }
  if (paso <= 2) return base
  if (paso <= 3)
    return {
      zonas: base.zonas,
      cantidadZonas: base.cantidadZonas,
      prevenirMismoClub: base.prevenirMismoClub,
      fechasLibres: base.fechasLibres,
      fechasInterzonales: base.fechasInterzonales,
      fixtureGenerado: base.fixtureGenerado,
      prevenirChoquesDeClub: base.prevenirChoquesDeClub
    }
  if (paso <= 4)
    return {
      fechasLibres: base.fechasLibres,
      fechasInterzonales: base.fechasInterzonales,
      fixtureGenerado: base.fixtureGenerado,
      prevenirChoquesDeClub: base.prevenirChoquesDeClub
    }
  return {}
}

export default function CrearTorneo() {
  const navigate = useNavigate()
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const accionPendienteRef = useRef<
    { tipo: 'next' } | { tipo: 'step'; targetStep: number } | null
  >(null)

  const {
    pasoActual,
    maxPasoAlcanzado,
    siguientePaso,
    pasoAnterior,
    irAlPaso,
    editandoDesdePasoResumen,
    setEditandoDesdePasoResumen
  } = useStoreWizard()

  const snapshotPasoRef = useRef<unknown>(null)

  const methods = useForm<DatosWizardTorneo>({
    defaultValues: datosIniciales,
    mode: 'onChange',
    resolver: zodResolver(esquemaTorneo)
  })

  const mutacion = useApiMutation({
    fn: async (nuevoTorneo: TorneoDTO) => {
      await api.torneoPOST(nuevoTorneo)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: 'Torneo creado correctamente'
  })

  // Validar el paso actual antes de avanzar
  const validarPasoActual = async () => {
    const datosForm = methods.getValues()

    try {
      switch (pasoActual) {
        case 1:
          await esquemaPaso1.parseAsync({
            nombre: datosForm.nombre,
            temporada: datosForm.temporada,
            tipo: datosForm.tipo,
            categorias: datosForm.categorias,
            formato: datosForm.formato
          })
          break

        case 2:
          await esquemaPaso2.parseAsync({
            fases: datosForm.fases
          })
          break

        case 3:
          await esquemaPaso3.parseAsync({
            cantidadEquipos: datosForm.cantidadEquipos,
            equiposSeleccionados: datosForm.equiposSeleccionados
          })
          break

        case 4:
          await esquemaPaso4.parseAsync({
            zonas: datosForm.zonas,
            equiposSeleccionados: datosForm.equiposSeleccionados
          })
          break

        case 5:
          await esquemaPaso5.parseAsync({
            fixtureGenerado: datosForm.fixtureGenerado
          })
          break
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const mensajes = [
          ...new Set(error.issues.map((issue) => issue.message))
        ]
        toast.error(
          mensajes.length === 1 ? (
            mensajes[0]
          ) : (
            <span className='block'>
              {mensajes.map((msg, i) => (
                <span key={i} className='block'>
                  • {msg}
                </span>
              ))}
            </span>
          )
        )
      } else {
        toast.error('Por favor, completa todos los campos requeridos')
      }
      return false
    }
  }

  const alEditarPaso = (paso: number) => {
    const datosForm = methods.getValues()
    snapshotPasoRef.current = obtenerDatosDePaso(datosForm, paso)
    setEditandoDesdePasoResumen(paso)
    irAlPaso(paso)
  }

  const debeMostrarConfirmacion = () => {
    if (
      editandoDesdePasoResumen === null ||
      editandoDesdePasoResumen !== pasoActual
    )
      return false
    const datosForm = methods.getValues()
    const actual = obtenerDatosDePaso(datosForm, pasoActual)
    const snapshot = snapshotPasoRef.current
    return JSON.stringify(actual) !== JSON.stringify(snapshot)
  }

  const aplicarReversion = () => {
    const snapshot = snapshotPasoRef.current as Record<string, unknown>
    if (!snapshot) return
    const actual = methods.getValues()
    const nuevosValores = { ...actual }
    if (pasoActual === 1) {
      Object.assign(nuevosValores, snapshot)
    } else if (pasoActual === 2) {
      nuevosValores.fases = snapshot.fases as DatosWizardTorneo['fases']
    } else if (pasoActual === 3) {
      Object.assign(nuevosValores, snapshot)
    } else if (pasoActual === 4) {
      nuevosValores.zonas = snapshot.zonas as DatosWizardTorneo['zonas']
      nuevosValores.prevenirMismoClub = snapshot.prevenirMismoClub as boolean
    } else if (pasoActual === 5) {
      Object.assign(nuevosValores, snapshot)
    }
    methods.reset(nuevosValores)
    setEditandoDesdePasoResumen(null)
    snapshotPasoRef.current = null
  }

  const aplicarConfirmacionYLimpieza = () => {
    const defaults = obtenerDefaultsDespuesDePaso(pasoActual)
    const actual = methods.getValues()
    methods.reset({ ...actual, ...defaults })
    setEditandoDesdePasoResumen(null)
    snapshotPasoRef.current = null
  }

  const alSiguiente = async () => {
    const esValido = await validarPasoActual()
    if (!esValido) return

    if (debeMostrarConfirmacion()) {
      accionPendienteRef.current = { tipo: 'next' }
      setConfirmacionAbierta(true)
      return
    }
    siguientePaso()
  }

  const alAnterior = () => pasoAnterior()

  const alClickearPaso = async (pasoDestino: number) => {
    if (pasoDestino === pasoActual) return
    if (pasoDestino < pasoActual) {
      irAlPaso(pasoDestino)
      return
    }
    const esValido = await validarPasoActual()
    if (!esValido) return
    if (pasoDestino > maxPasoAlcanzado) {
      toast.error(
        'Completa el paso actual y avanza con "Siguiente" para desbloquear más pasos'
      )
      return
    }

    if (debeMostrarConfirmacion()) {
      accionPendienteRef.current = { tipo: 'step', targetStep: pasoDestino }
      setConfirmacionAbierta(true)
      return
    }
    irAlPaso(pasoDestino)
  }

  const alRevertir = () => {
    aplicarReversion()
    setConfirmacionAbierta(false)
    accionPendienteRef.current = null
  }

  const alConfirmarYLimpiar = () => {
    aplicarConfirmacionYLimpieza()
    setConfirmacionAbierta(false)
    const pendiente = accionPendienteRef.current
    accionPendienteRef.current = null
    if (pendiente?.tipo === 'next') siguientePaso()
    else if (pendiente?.tipo === 'step') irAlPaso(pendiente.targetStep)
  }

  const alEnviar = methods.handleSubmit((datos) => {
    const nombre =
      datos.nombre || `Torneo ${datos.temporada} - ${datos.tipo || 'General'}`
    mutacion.mutate(new TorneoDTO({ nombre }))
  })

  return (
    <FormProvider {...methods}>
      <Card className='max-w-5xl mx-auto'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Crear nuevo torneo</CardTitle>
            <CardDescription>
              Completa los siguientes pasos para configurar tu torneo
            </CardDescription>
          </div>
          <BotonVolver
            path={rutasNavegacion.torneos}
            texto='Volver a torneos'
            onBeforeNavigate={() =>
              window.confirm(
                'Los cambios de este torneo se van a perder. ¿Estás seguro de que deseas salir?'
              )
            }
          />
        </CardHeader>
        <CardContent className='space-y-6'>
          <IndicadorDePasos
            pasoActual={pasoActual}
            maxPasoAlcanzado={maxPasoAlcanzado}
            totalPasos={6}
            alClickearPaso={alClickearPaso}
          />

          <div>
            {pasoActual === 1 && <Paso1Informacion />}
            {pasoActual === 2 && <Paso2Fases />}
            {pasoActual === 3 && <Paso3Equipos />}
            {pasoActual === 4 && <Paso4Zonas />}
            {pasoActual === 5 && <Paso5Fixture />}
            {pasoActual === 6 && <Paso6Resumen alEditarPaso={alEditarPaso} />}
          </div>

          <ModalCambiosDetectadosEnEdicion
            open={confirmacionAbierta}
            onOpenChange={(open) => {
              if (!open) accionPendienteRef.current = null
              setConfirmacionAbierta(open)
            }}
            onRevertir={alRevertir}
            onConfirmarYLimpiar={alConfirmarYLimpiar}
          />

          <div className='flex justify-between pt-4 border-t'>
            {pasoActual === 1 ? (
              <div />
            ) : (
              <Button
                type='button'
                className='h-11 w-28 text-sm'
                variant='outline'
                onClick={alAnterior}
              >
                Anterior
              </Button>
            )}

            {pasoActual < 6 ? (
              <Button
                type='button'
                className='h-11 w-28 text-sm'
                onClick={alSiguiente}
              >
                Siguiente
              </Button>
            ) : (
              <Boton
                type='button'
                className='h-11 w-28 text-sm'
                onClick={alEnviar}
                estaCargando={mutacion.isPending}
              >
                Crear torneo
              </Boton>
            )}
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  )
}
