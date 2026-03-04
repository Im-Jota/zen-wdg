import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Import modal system for global registration (Vue-based)
import '../src/composables/useModal'

createApp(App).mount('#app')
