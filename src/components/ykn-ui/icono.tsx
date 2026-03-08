import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'
import * as React from 'react'

/** Mapeo de nombres en castellano (por funcionalidad) a iconos de Lucide */
const MAPEO_ICONOS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  // Navegación / menú admin
  Torneos: LucideIcons.Trophy,
  Clubes: LucideIcons.Building2,
  Equipos: LucideIcons.ShieldHalf,
  Jugadores: LucideIcons.Users,
  Delegados: LucideIcons.UserCog,
  Reportes: LucideIcons.BarChart2,
  Usuario: LucideIcons.User,
  'Cerrar sesión': LucideIcons.LogOut,
  Menú: LucideIcons.Menu,

  // Acciones
  Descargar: LucideIcons.Download,
  Editar: LucideIcons.Pencil,
  Eliminar: LucideIcons.Trash2,
  Agregar: LucideIcons.Plus,
  'Agregar equipo': LucideIcons.CirclePlus,
  Subir: LucideIcons.Upload,
  Volver: LucideIcons.ArrowLeft,
  Cerrar: LucideIcons.X,

  // Estados / UI
  Cargando: LucideIcons.Loader2,
  Verificado: LucideIcons.Check,
  'Sin seleccionar': LucideIcons.Circle,
  Punto: LucideIcons.Circle,
  Filtros: LucideIcons.SlidersHorizontal,
  Expandir: LucideIcons.ChevronDown,
  Contraer: LucideIcons.ChevronUp,
  'Orden ascendente': LucideIcons.ChevronUp,
  'Orden descendente': LucideIcons.ChevronDown,
  Submenu: LucideIcons.ChevronRight,
  Anterior: LucideIcons.ChevronLeft,
  Siguiente: LucideIcons.ChevronRight,
  'Más opciones': LucideIcons.MoreVertical,

  // Datos personales
  Calendario: LucideIcons.Calendar,
  Carnet: LucideIcons.CreditCard,
  Clave: LucideIcons.Key,
  Email: LucideIcons.Mail,
  Teléfono: LucideIcons.Phone
}

export type NombreIcono = keyof typeof MAPEO_ICONOS

interface IconoProps {
  nombre: NombreIcono
  className?: string
}

export default function Icono({ nombre, className }: IconoProps) {
  const IconComponent = MAPEO_ICONOS[nombre]
  if (!IconComponent) {
    console.warn(`Icono no encontrado: "${nombre}"`)
    return null
  }
  return <IconComponent className={cn(className)} />
}
