import { defineCustomElement } from 'vue'
import ZClockWidget from './widgets/z-clock-widget.vue'
import ZSearchWidget from './widgets/z-search-widget.vue'
import ZTodoWidget from './widgets/z-todo-widget.vue'
import ZMarkedWidget from './widgets/z-marked-widget.vue'
import ZCalendarWidget from './widgets/z-calendar-widget.vue'
import ZWeatherWidget from './widgets/z-weather-widget.vue'
import ZNotesWidget from './widgets/z-notes-widget.vue'

// Import modal system to register globally (vanilla JS compatible)
import './utils/modalManager'

// Crear el custom element
const ZClockElement = defineCustomElement(ZClockWidget)
const ZSearchElement = defineCustomElement(ZSearchWidget)
const ZTodoElement = defineCustomElement(ZTodoWidget)
const ZMarkedElement = defineCustomElement(ZMarkedWidget)
const ZCalendarElement = defineCustomElement(ZCalendarWidget)
const ZWeatherElement = defineCustomElement(ZWeatherWidget)
const ZNotesElement = defineCustomElement(ZNotesWidget)

// Registrar custom element (evitar doble registro)
if (!customElements.get('z-clock-widget')) {
  customElements.define('z-clock-widget', ZClockElement)
}

if (!customElements.get('z-search-widget')) {
  customElements.define('z-search-widget', ZSearchElement)
}

if (!customElements.get('z-todo-widget')) {
  customElements.define('z-todo-widget', ZTodoElement)
}

if (!customElements.get('z-marked-widget')) {
  customElements.define('z-marked-widget', ZMarkedElement)
}

if (!customElements.get('z-calendar-widget')) {
  customElements.define('z-calendar-widget', ZCalendarElement)
}

if (!customElements.get('z-weather-widget')) {
  customElements.define('z-weather-widget', ZWeatherElement)
}

if (!customElements.get('z-notes-widget')) {
  customElements.define('z-notes-widget', ZNotesElement)
}

// Exportar componentes
export { ZClockWidget, ZSearchWidget, ZTodoWidget, ZMarkedWidget, ZCalendarWidget, ZWeatherWidget, ZNotesWidget }

// Exportar sistema de modales (vanilla JS compatible)
export { 
  showConfirm, 
  showAlert, 
  showPrompt, 
  showSuccess, 
  showError, 
  showWarning,
  showDeleteConfirm
} from './utils/modalManager'