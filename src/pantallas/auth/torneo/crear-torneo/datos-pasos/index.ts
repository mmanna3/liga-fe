import { paso1 } from './paso-1'
import { paso2 } from './paso-2'
import { paso3 } from './paso-3'
import { paso4 } from './paso-4'
import { paso5 } from './paso-5'
import { paso6 } from './paso-6'
import type { IPaso } from '../tipos-paso'
import type { DatosWizardTorneo } from '../tipos'

export { paso1, paso2, paso3, paso4, paso5, paso6 }

export const PASOS: IPaso<Partial<DatosWizardTorneo>>[] = [
  paso1,
  paso2,
  paso3,
  paso4,
  paso5,
  paso6
]
