import type { defineCustomElement, DefineCustomElementReturn } from 'vue';

import ClockWidget from './widgets/z-clock-widget.vue';
import SearchWidget from './widgets/z-search-widget.vue';
import TodoWidget from './widgets/z-todo-widget.vue';
import MarkedWidget from './widgets/z-marked-widget.vue';
import CalendarWidget from './widgets/z-calendar-widget.vue';
import WeatherWidget from './widgets/z-weather-widget.vue';
import NotesWidget from './widgets/z-notes-widget.vue';

export const ZClockWidget = defineCustomElement(ClockWidget);
export const ZSearchWidget = defineCustomElement(SearchWidget);
export const ZTodoWidget = defineCustomElement(TodoWidget);
export const ZMarkedWidget = defineCustomElement(MarkedWidget);
export const ZCalendarWidget = defineCustomElement(CalendarWidget);
export const ZWeatherWidget = defineCustomElement(WeatherWidget);
export const ZNotesWidget = defineCustomElement(NotesWidget);

// Modal system
export function showConfirm(options: object): Promise<boolean>;
export function showAlert(options: object): Promise<void>;
export function showPrompt(options: object): Promise<string | null>;
export function showSuccess(options: object): Promise<void>;
export function showError(options: object): Promise<void>;
export function showWarning(options: object): Promise<void>;
export function showDeleteConfirm(name: string, message?: string): Promise<boolean>;
export function useModal(): object;

// i18n system
export function getWidgetLocale(widget: string, locale?: string): Record<string, any>;
export function t(key: string, locale?: string, params?: Record<string, any>): string;
export function getAvailableLocales(): string[];
export declare const locales: Record<string, Record<string, any>>;

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
  if (!customElements.get('z-notes-widget')) {
    customElements.define('z-notes-widget', ZNotesWidget);
  }
}