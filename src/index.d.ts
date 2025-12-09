import type { defineCustomElement, DefineCustomElementReturn } from 'vue';

import ClockWidget from './widgets/z-clock-widget.vue';
import SearchWidget from './widgets/z-search-widget.vue';
import TodoWidget from './widgets/z-todo-widget.vue';
import MarkedWidget from './widgets/z-marked-widget.vue';
import CalendarWidget from './widgets/z-calendar-widget.vue';
import WeatherWidget from './widgets/z-weather-widget.vue';

export const ZClockWidget = defineCustomElement(ClockWidget);
export const ZSearchWidget = defineCustomElement(SearchWidget);
export const ZTodoWidget = defineCustomElement(TodoWidget);
export const ZMarkedWidget = defineCustomElement(MarkedWidget);
export const ZCalendarWidget = defineCustomElement(CalendarWidget);
export const ZWeatherWidget = defineCustomElement(WeatherWidget);

export function registerAllWidgets() {
  if (!customElements.get('z-clock-widget')) {
    customElements.define('z-clock-widget', ZClockWidget);
  }

  if (!customElements.get('z-search-widget')) {
    customElements.define('z-search-widget', ZSearchWidget);
  }

  if (!customElements.get('z-todo-widget')) {
    customElements.define('z-todo-widget', ZTodoWidget);
  }

  if (!customElements.get('z-marked-widget')) {
    customElements.define('z-marked-widget', ZMarkedWidget);
  }
  if (!customElements.get('z-calendar-widget')) {
    customElements.define('z-calendar-widget', ZCalendarWidget);
  }
  if (!customElements.get('z-weather-widget')) {
    customElements.define('z-weather-widget', ZWeatherWidget);
  }
}