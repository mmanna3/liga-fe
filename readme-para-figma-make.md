# 📘 README – Figma Make · Liga FE

## ⚠️ RESTRICCIÓN CRÍTICA

Si algo de lo que se solicita **SE CONTRADICE CON ESTE DOCUMENTO**, **antes de hacer cualquier cambio** se debe preguntar, anteponiendo en mayúsculas y bien llamativo:

> **🚨 ESTO SE CONTRADICE CON LOS LINEAMIENTOS QUE ESCRIBIÓ MATÍAS, ES MI DEBER AVISÁRTELO**

### Contexto importante

- Este documento fue escrito por el **arquitecto/programador (Matías)**.
- **Figma Make** es utilizado por la **diseñadora**.
- Es responsabilidad de quien implemente **minimizar la fricción entre ambas partes**:
  - Respetar este documento **y** los criterios de la diseñadora.
  - Ante dudas técnicas, sugerir explícitamente:  
    _“Preguntale a Matías para decidir sobre esta implementación”_.

---

## 🧱 Stack Tecnológico

### Framework Principal

- **React 19.2.4** con TypeScript
- **Vite 7.3.0** como bundler
- **React Router DOM v7.12.0** para navegación

---

## 🎨 Sistema de Estilos

- **Tailwind CSS v4.1.18**
  - Usar la nueva sintaxis con `@import`
- Usar `className` normalmente con clases de Tailwind
- **Siempre** usar la función `cn()` de `@/lib/utils` para combinar clases
- **shadcn/ui** estilo **"new-york"** como base de componentes
- **tailwind-merge + clsx** para merge de clases

### Ejemplo de uso correcto

```tsx
import { cn } from '@/lib/utils'
;<div
  className={cn(
    'text-lg font-bold',
    isActive && 'text-blue-500',
    props.className
  )}
/>
```

---

## 🧠 Gestión de Estado y Datos

- **Zustand v5.0.3** → estado global
- **TanStack Query v5.66.9** → fetching de datos
- **React Hook Form v7.54.2** → formularios

---

## 🧩 Componentes UI

- **Radix UI** → primitivos (Dialog, Dropdown, Select, etc.)
- **Lucide React v0.475.0** → iconos
  ❌ **NO usar otros iconos**
- **class-variance-authority** → variantes de componentes

---

## 📚 Librerías Adicionales

- **date-fns v3.6.0** → manejo y formateo de fechas
- **react-day-picker v9.13.1** → selector de fechas
- **sonner v2.0.1** → notificaciones (toast)

---

## 🗂️ Estructura de Carpetas

```txt
src/
├── components/
│   ├── ui/                # Componentes shadcn base (YA ESTÁN EN FIGMA - NO modificar)
│   └── ykn-ui/            # Componentes custom del proyecto (YA ESTÁN EN FIGMA)
├── pages/
│   └── [nombre-feature]/  # Páginas agrupadas por feature
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y helpers
├── api/                   # Cliente HTTP y tipos
├── routes/                # Definición de rutas
├── types/                 # Tipos TypeScript globales
└── sample-data/           # Datos de prueba (JSON, TS o TSX)
```

---

# 🧾 Convenciones de Nomenclatura y Estructura del Proyecto

## 📁 Archivos

- **kebab-case**
- Ejemplos:
  - `crear-delegado.tsx`
  - `detalle-club.tsx`

---

## 🧩 Componentes

- **PascalCase**
- Ejemplos:
  - `CrearDelegado`
  - `DetalleClub`

---

## 🔤 Props y Variables

- Usar **español** cuando sea dominio del negocio
- Ejemplos:
  - `estaCargando`
  - `equipoId`

---

## 🧭 Alias de Paths

- `@/` apunta a `src/`

---

# 🧭 Sistema de Rutas

## 📍 Definición de Rutas

Todas las rutas se definen en:

```
src/routes/rutas.ts
```

### ❌ Prohibido Hardcodear Rutas

Nunca escribas strings directos en el atributo `to` o `href`. Usa siempre el objeto centralizado de rutas.

- **Ubicación de Páginas:** `src/pages/[feature]/`
- **Mapeo Ruta → Componente:** `src/routes/mapa-rutas-componentes.tsx`

### ✅ Ejemplo Correcto

```tsx
import { rutasNavegacion } from '@/routes/rutas'
;<Link to={rutasNavegacion.crearClub}>Crear Club</Link>
```

### ❌ Ejemplo Incorrecto

```tsx
<Link to='/admin/clubs/crear'>Crear Club</Link>
```

---

# 🧱 Componentes: ui/ vs ykn-ui/

Dividimos los componentes en dos capas para proteger la base de Shadcn y facilitar la personalización.

| Directorio           | Origen  | Regla de Oro                                                |
| -------------------- | ------- | ----------------------------------------------------------- |
| `components/ui/`     | Shadcn  | NO modificar. Ya están definidos en Figma.                  |
| `components/ykn-ui/` | Propios | Componentes personalizados. Pueden envolver a los de `ui/`. |

---

## 🧩 Ejemplo de Componente Wrapper (ykn-ui)

```tsx
// components/ykn-ui/boton.tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

type BotonProps = React.ComponentProps<typeof Button> & {
  estaCargando?: boolean
}

export function Boton({ estaCargando, children, ...props }: BotonProps) {
  return (
    <Button className={cn('relative', props.className)} {...props}>
      {estaCargando ? <Loader2 className='animate-spin' /> : children}
      {!estaCargando && children}
    </Button>
  )
}
```

---

# 🧪 Datos de Prueba (Mocking)

Para no bloquear el desarrollo, creamos datos estáticos que luego serán conectados al backend por Matías.

- **Carpeta:** `src/sample-data/`
- **Formatos:** `.json`, `.ts`, `.tsx`

## Ejemplo de uso

```tsx
import { clubesMock } from '@/sample-data/clubes'

export default function Clubes() {
  const clubes = clubesMock // Luego se reemplaza con useQuery o Server Actions

  return (
    <div>
      {clubes.map((club) => (
        <div key={club.id}>{club.nombre}</div>
      ))}
    </div>
  )
}
```

---

# 📄 Ejemplo de Página Completa

Las páginas deben ser limpias y utilizar los alias de importación `@/`.

```tsx
// src/pages/admin/ejemplo/mi-feature.tsx

import { Titulo } from '@/components/ykn-ui/titulo'
import { Boton } from '@/components/ykn-ui/boton'
import { Card } from '@/components/ui/card'
import { datosEjemplo } from '@/sample-data/ejemplo'
import { cn } from '@/lib/utils'

export default function MiFeature() {
  return (
    <div className='space-y-4'>
      <Titulo>Mi Feature</Titulo>

      <Card className='p-6'>
        {datosEjemplo.map((item) => (
          <div
            key={item.id}
            className={cn('p-2', item.activo && 'bg-green-50')}
          >
            {item.nombre}
          </div>
        ))}
      </Card>

      <Boton onClick={() => alert('Acción')}>Guardar</Boton>
    </div>
  )
}
```

---

# 📏 Reglas Generales

## 📐 Límite de Líneas por Archivo

- ✅ **Ideal:** < 150 líneas
- ⚠️ **Tolerable:** 150–250 líneas
- 🚨 **Refactor inmediato:** > 250 líneas (requiere justificación)

**Principio fundamental:** Cada componente debe tener una **única responsabilidad**. Si un componente crece mucho, considera dividirlo en componentes más pequeños y reutilizables.

---

## ❌ Prohibiciones Estrictas

- **Iconos:** Usar únicamente `lucide-react`
- **Estilos:** Prohibido CSS Modules o Styled Components. Usar Tailwind CSS
- **Estado:** Solo se permite Zustand y TanStack Query
- **Rutas:** Prohibido el hardcodeo de strings

---

## ✅ Buenas Prácticas

- Usar siempre la función `cn()` para combinar clases de Tailwind
- Importar siempre usando el alias `@/`
- Mantener los componentes pequeños y con una única responsabilidad
- Usar los componentes comunes de `ykn-ui` que ya están en Figma: `Titulo`, `Boton`, `Tabla`, `Botonera`
- Crear componentes nuevos que valgan la pena dentro de `ykn-ui` o dentro de `general`

---

## ❓ ¿Dudas Técnicas?

👉 Ante cualquier duda sobre la implementación o arquitectura, **preguntale a Matías** antes de tomar una decisión por tu cuenta.
