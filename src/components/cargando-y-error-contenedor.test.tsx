import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContenedorCargandoYError } from './cargando-y-error-contenedor'

describe('ContenedorCargandoYError', () => {
  it('muestra el contenido cuando no esta cargando ni hay error', () => {
    render(
      <ContenedorCargandoYError estaCargando={false} hayError={false}>
        <div>Contenido</div>
      </ContenedorCargandoYError>
    )

    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('muestra skeletons cuando esta cargando', () => {
    render(
      <ContenedorCargandoYError estaCargando={true} hayError={false}>
        <div>Contenido</div>
      </ContenedorCargandoYError>
    )

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('muestra error con mensaje por defecto', () => {
    render(
      <ContenedorCargandoYError estaCargando={false} hayError={true}>
        <div>Contenido</div>
      </ContenedorCargandoYError>
    )

    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No se pudieron recuperar los datos.')
  })

  it('muestra error con mensaje personalizado', () => {
    render(
      <ContenedorCargandoYError
        estaCargando={false}
        hayError={true}
        mensajeDeError='El servidor no responde'
      >
        <div>Contenido</div>
      </ContenedorCargandoYError>
    )

    expect(screen.getByText('El servidor no responde')).toBeInTheDocument()
  })

  it('prioriza el estado de error sobre el de carga', () => {
    render(
      <ContenedorCargandoYError estaCargando={true} hayError={true}>
        <div>Contenido</div>
      </ContenedorCargandoYError>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No se pudieron recuperar los datos.')
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })
})
