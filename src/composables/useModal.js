/**
 * Composable for managing modals across the application
 * Provides a centralized way to show confirm, alert, and prompt dialogs
 * Made globally accessible for Web Components
 */

import { ref, h, render } from 'vue'
import ZModal from '../components/ZModal.vue'

// Make functions globally accessible for Web Components
if (typeof window !== 'undefined') {
  window.ZenModals = window.ZenModals || {}
}

// Global modal instance container
let modalContainer = null
let modalInstance = null

/**
 * Initialize modal container in the DOM
 */
function ensureModalContainer() {
  if (!modalContainer) {
    modalContainer = document.createElement('div')
    modalContainer.id = 'z-modal-container'
    document.body.appendChild(modalContainer)
  }
  return modalContainer
}

/**
 * Create and mount a modal instance
 */
function createModal(props) {
  const container = ensureModalContainer()
  
  // Create VNode
  const vnode = h(ZModal, {
    ...props,
    ref: (el) => {
      modalInstance = el
    }
  })
  
  // Render
  render(vnode, container)
  
  return modalInstance
}

/**
 * Show a confirmation dialog
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export function showConfirm(options = {}) {
  const {
    title = '',
    message = '¿Estás seguro?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    showIcon = true,
    confirmButtonClass = ''
  } = options

  const modal = createModal({
    title,
    message,
    modalType: 'confirm',
    confirmText,
    cancelText,
    showIcon,
    showCancel: true,
    confirmButtonClass
  })

  return modal.open()
}

/**
 * Show an alert dialog
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} - Resolves when dismissed
 */
export function showAlert(options = {}) {
  const {
    title = '',
    message = '',
    confirmText = 'Entendido',
    type = 'info', // 'success', 'error', 'warning', 'info'
    showIcon = true
  } = options

  const modal = createModal({
    title,
    message,
    modalType: type,
    confirmText,
    showIcon,
    showCancel: false
  })

  return modal.open()
}

/**
 * Show a prompt dialog
 * @param {Object} options - Configuration options
 * @returns {Promise<string|null>} - Resolves to input value if confirmed, null if cancelled
 */
export function showPrompt(options = {}) {
  const {
    title = '',
    message = '',
    inputLabel = '',
    inputPlaceholder = '',
    inputType = 'text',
    inputDefaultValue = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    showIcon = false
  } = options

  const modal = createModal({
    title,
    message,
    modalType: 'prompt',
    inputLabel,
    inputPlaceholder,
    inputType,
    inputDefaultValue,
    confirmText,
    cancelText,
    showIcon,
    showCancel: true
  })

  return modal.open().catch(() => null)
}

/**
 * Show a success message
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>}
 */
export function showSuccess(options = {}) {
  const {
    title = '¡Éxito!',
    message = 'Operación completada correctamente',
    confirmText = 'Aceptar'
  } = options

  return showAlert({
    title,
    message,
    confirmText,
    type: 'success'
  })
}

/**
 * Show an error message
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>}
 */
export function showError(options = {}) {
  const {
    title = 'Error',
    message = 'Ha ocurrido un error',
    confirmText = 'Entendido'
  } = options

  return showAlert({
    title,
    message,
    confirmText,
    type: 'error'
  })
}

/**
 * Show a warning message
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>}
 */
export function showWarning(options = {}) {
  const {
    title = 'Advertencia',
    message = '',
    confirmText = 'Entendido'
  } = options

  return showAlert({
    title,
    message,
    confirmText,
    type: 'warning'
  })
}

/**
 * Show a delete confirmation (pre-configured)
 * @param {string} itemName - Name of the item to delete
 * @returns {Promise<boolean>}
 */
export function showDeleteConfirm(itemName = 'este elemento') {
  return showConfirm({
    title: '¿Eliminar?',
    message: `¿Estás seguro de que deseas eliminar ${itemName}?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    confirmButtonClass: 'danger'
  })
}

/**
 * Composable hook for using modals in components
 */
export function useModal() {
  return {
    showConfirm,
    showAlert,
    showPrompt,
    showSuccess,
    showError,
    showWarning,
    showDeleteConfirm
  }
}

// Register functions globally for Web Components
if (typeof window !== 'undefined') {
  window.ZenModals.showConfirm = showConfirm
  window.ZenModals.showAlert = showAlert
  window.ZenModals.showPrompt = showPrompt
  window.ZenModals.showSuccess = showSuccess
  window.ZenModals.showError = showError
  window.ZenModals.showWarning = showWarning
  window.ZenModals.showDeleteConfirm = showDeleteConfirm
  window.ZenModals.useModal = useModal
}

export default useModal
