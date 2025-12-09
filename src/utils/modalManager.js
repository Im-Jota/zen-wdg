/**
 * Modal Manager - Sistema de modales vanilla JS para Web Components
 * Compatible con cualquier contexto (Vue, Web Components, etc.)
 */

class ModalManager {
  constructor() {
    this.currentModal = null
    this.resolveCallback = null
    this.rejectCallback = null
  }

  /**
   * Crea el HTML del modal
   */
  createModalHTML(config) {
    const {
      title = '',
      message = '',
      type = 'confirm',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      showCancel = true,
      showIcon = true,
      inputLabel = '',
      inputPlaceholder = '',
      inputType = 'text',
      inputDefaultValue = '',
      confirmButtonClass = ''
    } = config

    // Iconos según tipo
    const icons = {
      confirm: '⚠️',
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
      prompt: ''
    }

    // Clases de fondo según tipo
    const bgClasses = {
      confirm: 'modal-bg-confirm',
      prompt: 'modal-bg-prompt',
      success: 'modal-bg-success',
      error: 'modal-bg-error',
      warning: 'modal-bg-warning',
      info: 'modal-bg-info'
    }

    const iconHTML = showIcon && icons[type] ? 
      `<div class="z-modal-icon">${icons[type]}</div>` : ''

    const inputHTML = type === 'prompt' ? `
      <div class="z-modal-input-group">
        ${inputLabel ? `<label class="z-modal-label">${inputLabel}</label>` : ''}
        <input 
          type="${inputType}" 
          class="z-modal-input" 
          placeholder="${inputPlaceholder}"
          value="${inputDefaultValue}"
          id="z-modal-input"
        />
      </div>
    ` : ''

    const cancelBtnHTML = showCancel ? 
      `<button class="z-modal-btn z-modal-btn-cancel" data-action="cancel">${cancelText}</button>` : ''

    return `
      <div class="z-modal-overlay" data-action="overlay">
        <div class="z-modal-container ${bgClasses[type]} z-modal-size-medium">
          ${title ? `
            <div class="z-modal-header">
              <h3 class="z-modal-title">${title}</h3>
              <button class="z-modal-close" data-action="close" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          ` : ''}
          
          <div class="z-modal-body">
            ${iconHTML}
            ${message ? `<p class="z-modal-message">${message}</p>` : ''}
            ${inputHTML}
          </div>
          
          <div class="z-modal-footer">
            ${cancelBtnHTML}
            <button class="z-modal-btn z-modal-btn-confirm ${confirmButtonClass}" data-action="confirm">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Muestra un modal
   */
  show(config) {
    return new Promise((resolve, reject) => {
      // Cerrar modal existente
      if (this.currentModal) {
        this.close()
      }

      this.resolveCallback = resolve
      this.rejectCallback = reject

      // Crear modal
      const modalDiv = document.createElement('div')
      modalDiv.innerHTML = this.createModalHTML(config)
      this.currentModal = modalDiv.firstElementChild
      
      // Agregar al body
      document.body.appendChild(this.currentModal)

      // Inyectar estilos si no existen
      this.injectStyles()

      // Event listeners
      this.setupEventListeners(config.type)

      // Animación de entrada
      requestAnimationFrame(() => {
        this.currentModal.classList.add('z-modal-show')
      })

      // Focus en input si es prompt
      if (config.type === 'prompt') {
        setTimeout(() => {
          const input = document.getElementById('z-modal-input')
          if (input) input.focus()
        }, 100)
      }
    })
  }

  /**
   * Configura event listeners
   */
  setupEventListeners(type) {
    const handleClick = (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action
      
      if (action === 'confirm') {
        if (type === 'prompt') {
          const input = document.getElementById('z-modal-input')
          this.resolve(input ? input.value : '')
        } else {
          this.resolve(true)
        }
      } else if (action === 'cancel' || action === 'close') {
        this.resolve(false)
      } else if (action === 'overlay') {
        this.resolve(false)
      }
    }

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.resolve(false)
      } else if (e.key === 'Enter' && type === 'prompt') {
        const input = document.getElementById('z-modal-input')
        this.resolve(input ? input.value : '')
      }
    }

    this.currentModal.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeydown)

    // Guardar para cleanup
    this.currentModal._handleClick = handleClick
    this.currentModal._handleKeydown = handleKeydown
  }

  /**
   * Resuelve y cierra el modal
   */
  resolve(value) {
    if (this.resolveCallback) {
      this.resolveCallback(value)
    }
    this.close()
  }

  /**
   * Cierra el modal
   */
  close() {
    if (!this.currentModal) return

    // Remover event listeners
    if (this.currentModal._handleClick) {
      this.currentModal.removeEventListener('click', this.currentModal._handleClick)
    }
    if (this.currentModal._handleKeydown) {
      document.removeEventListener('keydown', this.currentModal._handleKeydown)
    }

    // Animación de salida
    this.currentModal.classList.remove('z-modal-show')
    
    setTimeout(() => {
      if (this.currentModal && this.currentModal.parentNode) {
        this.currentModal.parentNode.removeChild(this.currentModal)
      }
      this.currentModal = null
      this.resolveCallback = null
      this.rejectCallback = null
    }, 300)
  }

  /**
   * Inyecta los estilos CSS del modal
   */
  injectStyles() {
    if (document.getElementById('z-modal-styles')) return

    const style = document.createElement('style')
    style.id = 'z-modal-styles'
    style.textContent = `
      .z-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .z-modal-overlay.z-modal-show {
        opacity: 1;
      }

      .z-modal-overlay.z-modal-show .z-modal-container {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .z-modal-container {
        background: rgba(30, 30, 35, 0.95);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        color: #fff;
        transform: translateY(-30px) scale(0.95);
        opacity: 0;
        transition: all 0.3s ease;
      }

      .z-modal-size-medium {
        width: 450px;
      }

      .z-modal-bg-success {
        background: rgba(16, 185, 129, 0.95);
      }

      .z-modal-bg-error, .z-modal-bg-warning {
        background: rgba(239, 68, 68, 0.95);
      }

      .z-modal-bg-info {
        background: rgba(59, 130, 246, 0.95);
      }

      .z-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 24px 16px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .z-modal-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .z-modal-close {
        background: none;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: currentColor;
        transition: all 0.2s ease;
        opacity: 0.7;
      }

      .z-modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        opacity: 1;
      }

      .z-modal-body {
        padding: 24px;
        text-align: center;
      }

      .z-modal-icon {
        font-size: 3rem;
        margin-bottom: 16px;
        animation: z-modal-icon-bounce 0.5s ease-out;
      }

      @keyframes z-modal-icon-bounce {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      .z-modal-message {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
        opacity: 0.95;
      }

      .z-modal-input-group {
        margin-top: 20px;
        text-align: left;
      }

      .z-modal-label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        opacity: 0.9;
      }

      .z-modal-input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 1rem;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .z-modal-input:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.15);
      }

      .z-modal-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .z-modal-footer {
        display: flex;
        gap: 12px;
        padding: 16px 24px 24px 24px;
        justify-content: flex-end;
      }

      .z-modal-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 100px;
      }

      .z-modal-btn-cancel {
        background: rgba(255, 255, 255, 0.1);
        color: currentColor;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .z-modal-btn-cancel:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .z-modal-btn-confirm {
        background: rgba(255, 255, 255, 0.9);
        color: #1a1a1a;
      }

      .z-modal-btn-confirm:hover {
        background: #fff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .z-modal-btn-confirm.danger {
        background: #ef4444;
        color: white;
      }

      .z-modal-btn-confirm.danger:hover {
        background: #dc2626;
      }

      @media (max-width: 768px) {
        .z-modal-container {
          width: 100% !important;
          max-width: 400px;
        }

        .z-modal-footer {
          flex-direction: column-reverse;
        }

        .z-modal-btn {
          width: 100%;
        }
      }
    `
    document.head.appendChild(style)
  }
}

// Instancia global
const modalManager = new ModalManager()

// Funciones helper
export function showConfirm(options = {}) {
  return modalManager.show({
    type: 'confirm',
    showCancel: true,
    showIcon: true,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    ...options
  })
}

export function showAlert(options = {}) {
  const { type = 'info', ...rest } = options
  return modalManager.show({
    type,
    showCancel: false,
    showIcon: true,
    confirmText: 'Entendido',
    ...rest
  })
}

export function showPrompt(options = {}) {
  return modalManager.show({
    type: 'prompt',
    showCancel: true,
    showIcon: false,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    inputType: 'text',
    inputDefaultValue: '',
    ...options
  })
}

export function showSuccess(options = {}) {
  return showAlert({
    type: 'success',
    title: '¡Éxito!',
    message: 'Operación completada correctamente',
    ...options
  })
}

export function showError(options = {}) {
  return showAlert({
    type: 'error',
    title: 'Error',
    message: 'Ha ocurrido un error',
    ...options
  })
}

export function showWarning(options = {}) {
  return showAlert({
    type: 'warning',
    title: 'Advertencia',
    ...options
  })
}

export function showDeleteConfirm(itemName = 'este elemento') {
  return showConfirm({
    title: '¿Eliminar?',
    message: `¿Estás seguro de que deseas eliminar ${itemName}?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    confirmButtonClass: 'danger'
  })
}

// Registrar globalmente
if (typeof window !== 'undefined') {
  window.ZenModals = {
    showConfirm,
    showAlert,
    showPrompt,
    showSuccess,
    showError,
    showWarning,
    showDeleteConfirm
  }
}
