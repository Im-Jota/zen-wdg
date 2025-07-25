import type { defineCustomElement, DefineCustomElementReturn } from 'vue';

import ClockWidget from './widgets/z-clock-widget.vue';
import SearchWidget from './widgets/z-search-widget.vue';
import TodoWidget from './widgets/z-todo-widget.vue';
import MarkedWidget from './widgets/z-marked-widget.vue';

export const ZClockWidget = defineCustomElement(ClockWidget);
export const ZSearchWidget = defineCustomElement(SearchWidget);
export const ZTodoWidget = defineCustomElement(TodoWidget);
export const ZMarkedWidget = defineCustomElement(MarkedWidget);

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
}