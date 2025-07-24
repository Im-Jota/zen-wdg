import { defineCustomElement } from 'vue'
import ZClockWidget from './widgets/z-clock-widget.vue'

// Crear el custom element
const ZClockElement = defineCustomElement(ZClockWidget)

// Registrar custom element (evitar doble registro)
if (!customElements.get('z-clock-widget')) {
  customElements.define('z-clock-widget', ZClockElement)
}

// Exportar el componente para uso tradicional Vue
export { ZClockWidget }