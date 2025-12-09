<template>
  <div class="gallery-container">
    <!-- Header -->
    <header class="gallery-header">
      <div class="header-content">
        <h1>🎨 Zen Widget Gallery</h1>
        <p>Modo Visual - Previsualización de Widgets</p>
      </div>
      <div class="view-controls">
        <button 
          :class="['view-btn', { active: viewMode === 'grid' }]"
          @click="viewMode = 'grid'"
        >
          📱 Grid
        </button>
        <button 
          :class="['view-btn', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
        >
          📋 Lista
        </button>
        <button 
          :class="['view-btn', { active: viewMode === 'full' }]"
          @click="viewMode = 'full'"
        >
          🖼️ Completo
        </button>
      </div>
    </header>

    <!-- Widget Gallery -->
    <main class="gallery-main" :class="`view-${viewMode}`">
      <div 
        v-for="widget in widgets" 
        :key="widget.name"
        class="widget-card"
        :class="{ 'selected': selectedWidget === widget.name }"
        @click="selectWidget(widget.name)"
      >
        <div class="widget-header">
          <h3>{{ widget.title }}</h3>
          <div class="widget-meta">
            <span class="widget-tag">{{ widget.category }}</span>
            <span class="widget-status" :class="widget.status">{{ widget.status }}</span>
          </div>
        </div>
        
        <div class="widget-preview">
          <component :is="widget.component" />
        </div>
        
        <div class="widget-info">
          <p class="widget-description">{{ widget.description }}</p>
          <div class="widget-actions">
            <button @click.stop="copyWidgetCode(widget.name)" class="action-btn">
              📋 Copiar Código
            </button>
            <button @click.stop="openInEditor(widget.file)" class="action-btn">
              ✏️ Editar
            </button>
          </div>
        </div>
      </div>

      <!-- Placeholder para nuevos widgets -->
      <div class="widget-card new-widget" @click="createNewWidget">
        <div class="new-widget-content">
          <div class="plus-icon">+</div>
          <h3>Crear Nuevo Widget</h3>
          <p>Haz click para empezar</p>
        </div>
      </div>
    </main>

    <!-- Widget Detail Panel (cuando se selecciona un widget) -->
    <aside v-if="selectedWidget" class="detail-panel">
      <div class="detail-header">
        <h2>{{ getSelectedWidgetInfo().title }}</h2>
        <button @click="selectedWidget = null" class="close-btn">✕</button>
      </div>
      <div class="detail-content">
        <div class="detail-section">
          <h4>Información</h4>
          <ul class="info-list">
            <li><strong>Nombre:</strong> {{ getSelectedWidgetInfo().name }}</li>
            <li><strong>Archivo:</strong> {{ getSelectedWidgetInfo().file }}</li>
            <li><strong>Categoría:</strong> {{ getSelectedWidgetInfo().category }}</li>
            <li><strong>Estado:</strong> {{ getSelectedWidgetInfo().status }}</li>
          </ul>
        </div>
        
        <div class="detail-section">
          <h4>Uso</h4>
          <pre class="code-block"><code>&lt;{{ getSelectedWidgetInfo().name }} /&gt;</code></pre>
        </div>

        <div class="detail-section">
          <h4>Vista Previa Ampliada</h4>
          <div class="large-preview">
            <component :is="getSelectedWidgetInfo().component" />
          </div>
        </div>
      </div>
    </aside>

    <!-- Notification Toast -->
    <transition name="fade">
      <div v-if="notification" class="notification">
        {{ notification }}
      </div>
    </transition>
  </div>
</template>

<script>
import ZClockWidget from '../src/widgets/z-clock-widget.vue'
import ZSearchWidget from '../src/widgets/z-search-widget.vue'
import ZTodoWidget from '../src/widgets/z-todo-widget.vue'
import ZMarkedWidget from '../src/widgets/z-marked-widget.vue'
import ZCalendarWidget from '../src/widgets/z-calendar-widget.vue'
import ZWeatherWidget from '../src/widgets/z-weather-widget.vue'
import ZNotesWidget from '../src/widgets/z-notes-widget.vue'

export default {
  name: 'WidgetGallery',
  components: {
    ZClockWidget,
    ZSearchWidget,
    ZTodoWidget,
    ZMarkedWidget,
    ZCalendarWidget,
    ZWeatherWidget,
    ZNotesWidget
  },
  data() {
    return {
      viewMode: 'grid', // 'grid', 'list', 'full'
      selectedWidget: null,
      notification: null,
      widgets: [
        {
          name: 'z-clock-widget',
          title: '🕐 Reloj',
          component: 'ZClockWidget',
          category: 'Utilidad',
          status: 'stable',
          description: 'Widget de reloj digital con fecha y hora en tiempo real',
          file: 'z-clock-widget.vue'
        },
        {
          name: 'z-search-widget',
          title: '🔍 Búsqueda',
          component: 'ZSearchWidget',
          category: 'Navegación',
          status: 'stable',
          description: 'Motor de búsqueda integrado con múltiples proveedores',
          file: 'z-search-widget.vue'
        },
        {
          name: 'z-todo-widget',
          title: '📝 Tareas',
          component: 'ZTodoWidget',
          category: 'Productividad',
          status: 'stable',
          description: 'Lista de tareas con gestión de pendientes y completadas',
          file: 'z-todo-widget.vue'
        },
        {
          name: 'z-marked-widget',
          title: '📄 Marcadores',
          component: 'ZMarkedWidget',
          category: 'Navegación',
          status: 'stable',
          description: 'Gestor de marcadores con categorías y favicons inteligentes',
          file: 'z-marked-widget.vue'
        },
        {
          name: 'z-calendar-widget',
          title: '📅 Calendario',
          component: 'ZCalendarWidget',
          category: 'Productividad',
          status: 'stable',
          description: 'Calendario con eventos, vistas múltiples y almacenamiento local',
          file: 'z-calendar-widget.vue'
        },
        {
          name: 'z-weather-widget',
          title: '🌤️ Clima',
          component: 'ZWeatherWidget',
          category: 'Información',
          status: 'stable',
          description: 'Widget de clima en tiempo real con geolocalización automática',
          file: 'z-weather-widget.vue'
        },
        {
          name: 'z-notes-widget',
          title: '📝 Notas',
          component: 'ZNotesWidget',
          category: 'Productividad',
          status: 'stable',
          description: 'Notas rápidas con categorías, fijación y exportación a texto',
          file: 'z-notes-widget.vue'
        }
      ]
    }
  },
  methods: {
    selectWidget(name) {
      this.selectedWidget = this.selectedWidget === name ? null : name
    },
    getSelectedWidgetInfo() {
      return this.widgets.find(w => w.name === this.selectedWidget) || {}
    },
    copyWidgetCode(name) {
      const code = `<${name} />`
      navigator.clipboard.writeText(code).then(() => {
        this.showNotification(`Código copiado: ${code}`)
      })
    },
    openInEditor(file) {
      this.showNotification(`Abriendo ${file} en el editor...`)
      // Esta funcionalidad se integraría con el IDE
      console.log(`Abrir archivo: src/widgets/${file}`)
    },
    createNewWidget() {
      this.showNotification('Funcionalidad de creación de widgets en desarrollo...')
      // Aquí se podría abrir un wizard para crear un nuevo widget
    },
    showNotification(message) {
      this.notification = message
      setTimeout(() => {
        this.notification = null
      }, 3000)
    }
  }
}
</script>

<style scoped>
.gallery-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* Header */
.gallery-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 1.1rem;
}

.view-controls {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 10px 20px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.view-btn.active {
  background: #667eea;
  color: white;
}

/* Main Gallery */
.gallery-main {
  display: grid;
  gap: 25px;
  transition: all 0.3s ease;
}

.gallery-main.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.gallery-main.view-list {
  grid-template-columns: 1fr;
}

.gallery-main.view-full {
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
}

/* Widget Card */
.widget-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.widget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.widget-card.selected {
  outline: 3px solid #667eea;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px #667eea;
}

.widget-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.widget-header h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: #333;
}

.widget-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.widget-tag {
  padding: 5px 12px;
  background: white;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
}

.widget-status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.widget-status.stable {
  background: #10b981;
  color: white;
}

.widget-status.beta {
  background: #f59e0b;
  color: white;
}

.widget-status.experimental {
  background: #ef4444;
  color: white;
}

.widget-preview {
  padding: 20px;
  background: #1a1a1a;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  overflow: hidden;
}

.view-full .widget-preview {
  min-height: 600px;
}

.widget-info {
  padding: 20px;
}

.widget-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.widget-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #667eea;
  color: white;
}

/* New Widget Card */
.new-widget {
  border: 3px dashed #667eea;
  background: rgba(255, 255, 255, 0.5);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-widget:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: #764ba2;
}

.new-widget-content {
  text-align: center;
  color: #667eea;
}

.plus-icon {
  font-size: 4rem;
  font-weight: 300;
  margin-bottom: 10px;
}

.new-widget-content h3 {
  margin: 0;
  font-size: 1.5rem;
}

.new-widget-content p {
  color: #999;
  margin: 10px 0 0 0;
}

/* Detail Panel */
.detail-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 450px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
  overflow-y: auto;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #ef4444;
  color: white;
  transform: rotate(90deg);
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  margin: 0 0 15px 0;
  color: #667eea;
  font-size: 1.1rem;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-list li {
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
  color: #666;
}

.info-list li:last-child {
  border-bottom: none;
}

.code-block {
  background: #1a1a1a;
  color: #10b981;
  padding: 15px;
  border-radius: 10px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.large-preview {
  background: #1a1a1a;
  padding: 20px;
  border-radius: 15px;
  min-height: 300px;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #10b981;
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .gallery-header {
    flex-direction: column;
    text-align: center;
  }

  .gallery-main.view-grid,
  .gallery-main.view-full {
    grid-template-columns: 1fr;
  }

  .detail-panel {
    width: 100%;
  }
  
  .header-content h1 {
    font-size: 1.8rem;
  }
}
</style>
