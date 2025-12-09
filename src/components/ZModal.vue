<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container" :class="[modalType, size]">
          <!-- Header -->
          <div v-if="title || showClose" class="modal-header">
            <h3 v-if="title" class="modal-title">{{ title }}</h3>
            <button v-if="showClose" @click="close" class="modal-close" aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <!-- Icon based on type -->
            <div v-if="showIcon" class="modal-icon">
              <span v-if="modalType === 'confirm'" class="icon-confirm">⚠️</span>
              <span v-else-if="modalType === 'success'" class="icon-success">✅</span>
              <span v-else-if="modalType === 'error'" class="icon-error">❌</span>
              <span v-else-if="modalType === 'info'" class="icon-info">ℹ️</span>
              <span v-else-if="modalType === 'warning'" class="icon-warning">⚠️</span>
            </div>

            <!-- Message -->
            <p v-if="message" class="modal-message">{{ message }}</p>

            <!-- Input field for prompt type -->
            <div v-if="modalType === 'prompt'" class="modal-input-group">
              <label v-if="inputLabel" class="modal-label">{{ inputLabel }}</label>
              <input
                ref="inputRef"
                v-model="inputValue"
                :type="inputType"
                :placeholder="inputPlaceholder"
                class="modal-input"
                @keyup.enter="confirm"
                @keyup.esc="close"
              />
            </div>

            <!-- Slot for custom content -->
            <div v-if="$slots.default" class="modal-custom-content">
              <slot></slot>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button
              v-if="showCancel"
              @click="cancel"
              class="modal-btn modal-btn-cancel"
            >
              {{ cancelText }}
            </button>
            <button
              @click="confirm"
              class="modal-btn modal-btn-confirm"
              :class="confirmButtonClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'ZModal',
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    modalType: {
      type: String,
      default: 'confirm', // 'confirm', 'alert', 'prompt', 'success', 'error', 'info', 'warning'
      validator: (value) => ['confirm', 'alert', 'prompt', 'success', 'error', 'info', 'warning'].includes(value)
    },
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    showClose: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    // For prompt type
    inputLabel: {
      type: String,
      default: ''
    },
    inputPlaceholder: {
      type: String,
      default: ''
    },
    inputType: {
      type: String,
      default: 'text'
    },
    inputDefaultValue: {
      type: String,
      default: ''
    },
    // Custom button styling
    confirmButtonClass: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isOpen: false,
      inputValue: this.inputDefaultValue,
      resolvePromise: null,
      rejectPromise: null
    }
  },
  mounted() {
    // Focus input if prompt type
    if (this.modalType === 'prompt' && this.isOpen) {
      this.$nextTick(() => {
        this.$refs.inputRef?.focus()
      })
    }
  },
  methods: {
    open() {
      this.isOpen = true
      this.inputValue = this.inputDefaultValue
      
      // Focus input for prompt
      if (this.modalType === 'prompt') {
        this.$nextTick(() => {
          this.$refs.inputRef?.focus()
        })
      }

      // Return a promise for programmatic usage
      return new Promise((resolve, reject) => {
        this.resolvePromise = resolve
        this.rejectPromise = reject
      })
    },
    close() {
      this.isOpen = false
      if (this.rejectPromise) {
        this.rejectPromise(false)
      }
      this.$emit('close')
    },
    confirm() {
      const result = this.modalType === 'prompt' ? this.inputValue : true
      
      if (this.resolvePromise) {
        this.resolvePromise(result)
      }
      
      this.$emit('confirm', result)
      this.isOpen = false
    },
    cancel() {
      if (this.rejectPromise) {
        this.rejectPromise(false)
      }
      this.$emit('cancel')
      this.isOpen = false
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
/* Overlay */
.modal-overlay {
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
  z-index: 9999;
  padding: 20px;
}

/* Container */
.modal-container {
  background: rgba(255, 255, 255, 0.95);
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
  animation: modalSlideIn 0.3s ease-out;
}

/* Sizes */
.modal-container.small {
  width: 350px;
}

.modal-container.medium {
  width: 450px;
}

.modal-container.large {
  width: 600px;
}

/* Type variants - Dark background */
.modal-container.confirm,
.modal-container.prompt {
  background: rgba(30, 30, 35, 0.95);
  color: #fff;
}

.modal-container.success {
  background: rgba(16, 185, 129, 0.95);
  color: #fff;
}

.modal-container.error,
.modal-container.warning {
  background: rgba(239, 68, 68, 0.95);
  color: #fff;
}

.modal-container.info {
  background: rgba(59, 130, 246, 0.95);
  color: #fff;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
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

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

/* Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: iconBounce 0.5s ease-out;
}

.modal-message {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.95;
}

/* Input for prompt */
.modal-input-group {
  margin-top: 20px;
  text-align: left;
}

.modal-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.modal-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.modal-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.modal-custom-content {
  margin-top: 16px;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.modal-btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: currentColor;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.modal-btn-confirm {
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
}

.modal-btn-confirm:hover {
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Confirm button variants */
.modal-btn-confirm.danger {
  background: #ef4444;
  color: white;
}

.modal-btn-confirm.danger:hover {
  background: #dc2626;
}

.modal-btn-confirm.success {
  background: #10b981;
  color: white;
}

.modal-btn-confirm.success:hover {
  background: #059669;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modalSlideIn 0.3s ease-out;
}

.modal-fade-leave-active .modal-container {
  animation: modalSlideOut 0.3s ease-in;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
}

@keyframes iconBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    width: 100% !important;
    max-width: 400px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>
