import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  esquemaPaso1,
  esquemaPaso2,
  esquemaPaso3,
  esquemaPaso4,
  esquemaPaso5,
  esquemaTorneo
} from './esquema-validacion'
import type { DatosWizardTorneo } from './tipos'
import { useStoreWizard } from './use-store-wizard'
import { datosIniciales } from './wizard-datos-iniciales'

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

export function useNavegacionWizard() {
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const accionPendienteRef = useRef<
    { tipo: 'next' } | { tipo: 'step'; targetStep: number } | null
  >(null)
  const snapshotPasoRef = useRef<unknown>(null)

  const {
    pasoActual,
    maxPasoAlcanzado,
    siguientePaso,
    pasoAnterior,
    irAlPaso,
    editandoDesdePasoResumen,
    setEditandoDesdePasoResumen
  } = useStoreWizard()

  const methods = useForm<DatosWizardTorneo>({
    defaultValues: datosIniciales,
    mode: 'onChange',
    resolver: zodResolver(esquemaTorneo)
  })

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
          await esquemaPaso2.parseAsync({ fases: datosForm.fases })
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
        const mensajes = [...new Set(error.issues.map((i) => i.message))]
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

  const debeMostrarConfirmacion = () => {
    if (
      editandoDesdePasoResumen === null ||
      editandoDesdePasoResumen !== pasoActual
    )
      return false
    const actual = obtenerDatosDePaso(methods.getValues(), pasoActual)
    return JSON.stringify(actual) !== JSON.stringify(snapshotPasoRef.current)
  }

  const aplicarReversion = () => {
    const snapshot = snapshotPasoRef.current as Record<string, unknown>
    if (!snapshot) return
    const nuevosValores = { ...methods.getValues() }
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
    methods.reset({ ...methods.getValues(), ...defaults })
    setEditandoDesdePasoResumen(null)
    snapshotPasoRef.current = null
  }

  const alEditarPaso = (paso: number) => {
    snapshotPasoRef.current = obtenerDatosDePaso(methods.getValues(), paso)
    setEditandoDesdePasoResumen(paso)
    irAlPaso(paso)
  }

  const alSiguiente = async () => {
    if (!(await validarPasoActual())) return
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
    if (!(await validarPasoActual())) return
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

  return {
    methods,
    pasoActual,
    maxPasoAlcanzado,
    confirmacionAbierta,
    accionPendienteRef,
    alSiguiente,
    alAnterior,
    alClickearPaso,
    alEditarPaso,
    alRevertir,
    alConfirmarYLimpiar
  }
}
