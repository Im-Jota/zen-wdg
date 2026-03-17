import { defineCustomElement } from 'vue'
import './styles/zen-theme.css'
import { getWidgetLocale, t, getAvailableLocales, locales } from './i18n/widget-locales'
import ZSearchWidget from './widgets/z-search-widget.vue'
import ZMarkedWidget from './widgets/z-marked-widget.vue'

// Import modal system to register globally (Vue-based)
import './composables/useModal'

// Crear el custom element
const ZSearchElement = defineCustomElement(ZSearchWidget)
const ZMarkedElement = defineCustomElement(ZMarkedWidget)

// Registrar custom element (evitar doble registro)
if (!customElements.get('z-search-widget')) {
  customElements.define('z-search-widget', ZSearchElement)
}

if (!customElements.get('z-marked-widget')) {
  customElements.define('z-marked-widget', ZMarkedElement)
}

// Exportar componentes
export { ZSearchWidget, ZMarkedWidget }

// Exportar sistema de modales (Vue-based, globally registered)
export { 
  showConfirm, 
  showAlert, 
  showPrompt, 
  showSuccess, 
  showError, 
  showWarning,
  showDeleteConfirm,
  useModal
} from './composables/useModal'

// Exportar sistema i18n
export { getWidgetLocale, t, getAvailableLocales, locales } from './i18n/widget-locales'