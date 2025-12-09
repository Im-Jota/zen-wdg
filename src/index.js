import { defineCustomElement } from 'vue'
import ZClockWidget from './widgets/z-clock-widget.vue'
import ZSearchWidget from './widgets/z-search-widget.vue'
import ZTodoWidget from './widgets/z-todo-widget.vue'
import ZMarkedWidget from './widgets/z-marked-widget.vue'
import ZCalendarWidget from './widgets/z-calendar-widget.vue'
import ZWeatherWidget from './widgets/z-weather-widget.vue'

// Crear el custom element
const ZClockElement = defineCustomElement(ZClockWidget)
const ZSearchElement = defineCustomElement(ZSearchWidget)
const ZTodoElement = defineCustomElement(ZTodoWidget)
const ZMarkedElement = defineCustomElement(ZMarkedWidget)
const ZCalendarElement = defineCustomElement(ZCalendarWidget)
const ZWeatherElement = defineCustomElement(ZWeatherWidget)

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

// Exportar el componente para uso tradicional Vue
export { ZClockWidget, ZSearchWidget, ZTodoWidget, ZMarkedWidget, ZCalendarWidget, ZWeatherWidget }