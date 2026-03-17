import type { defineCustomElement, DefineCustomElementReturn } from 'vue';

import SearchWidget from './widgets/z-search-widget.vue';
import MarkedWidget from './widgets/z-marked-widget.vue';

export const ZSearchWidget = defineCustomElement(SearchWidget);
export const ZMarkedWidget = defineCustomElement(MarkedWidget);

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
  if (!customElements.get('z-search-widget')) {
    customElements.define('z-search-widget', ZSearchWidget);
  }

  if (!customElements.get('z-marked-widget')) {
    customElements.define('z-marked-widget', ZMarkedWidget);
  }
}