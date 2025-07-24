import type { defineCustomElement, DefineCustomElementReturn } from 'vue';

import ClockWidget from './widgets/z-clock-widget.vue';
import SearchWidget from './widgets/z-search-widget.vue'

export const ZClockWidget = defineCustomElement(ClockWidget);
export const ZSearchWidget = defineCustomElement(SearchWidget);

export function registerAllWidgets() {
  if (!customElements.get('z-clock-widget')) {
    customElements.define('z-clock-widget', ZClockWidget);
  }

  if (!customElements.get('z-search-widget')) {
    customElements.define('z-search-widget', ZSearchWidget);
  }
}