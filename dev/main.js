import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Import modal system for global registration (vanilla JS compatible)
import '../src/utils/modalManager'

createApp(App).mount('#app')
